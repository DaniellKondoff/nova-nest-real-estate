import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import {
  getCrmContactById,
  updateCrmContact,
  deleteCrmContact,
} from "@/lib/queries/crm";

async function requireAdmin(supabase: Awaited<ReturnType<typeof getServerClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { user: null, unauthorized: true, forbidden: false };

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (adminError || !adminProfile) return { user, unauthorized: false, forbidden: true };

  return { user, unauthorized: false, forbidden: false };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    const auth = await requireAdmin(supabase);

    if (auth.unauthorized) {
      return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
    }
    if (auth.forbidden) {
      return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });
    }

    const { id } = await params;
    const contact = await getCrmContactById(id);

    if (!contact) {
      return NextResponse.json({ error: "Контактът не е намерен" }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("GET /api/admin/crm/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Грешка при зареждане на контакта" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    const auth = await requireAdmin(supabase);

    if (auth.unauthorized) {
      return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
    }
    if (auth.forbidden) {
      return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Build partial update — only include keys the caller sent
    const input: Record<string, unknown> = {};
    if (body.full_name !== undefined) input.full_name = body.full_name;
    if (body.phone !== undefined) input.phone = body.phone;
    if (body.email !== undefined) input.email = body.email;
    if (body.budget_min !== undefined) input.budget_min = body.budget_min;
    if (body.budget_max !== undefined) input.budget_max = body.budget_max;
    if (body.budget_currency !== undefined) input.budget_currency = body.budget_currency;
    if (body.status !== undefined) input.status = body.status;
    if (body.client_types !== undefined) input.client_types = body.client_types;
    if (body.general_notes !== undefined) input.general_notes = body.general_notes;

    // updateCrmContact throws if the row doesn't exist (PGRST116 re-thrown)
    const contact = await updateCrmContact(id, input);

    return NextResponse.json({ contact });
  } catch (error: unknown) {
    const pgError = error as { code?: string } | null;
    if (pgError?.code === "PGRST116") {
      return NextResponse.json({ error: "Контактът не е намерен" }, { status: 404 });
    }
    console.error("PUT /api/admin/crm/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Грешка при обновяване на контакта" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    const auth = await requireAdmin(supabase);

    if (auth.unauthorized) {
      return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
    }
    if (auth.forbidden) {
      return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });
    }

    const { id } = await params;

    // Verify contact exists before deleting
    const existing = await getCrmContactById(id);
    if (!existing) {
      return NextResponse.json({ error: "Контактът не е намерен" }, { status: 404 });
    }

    await deleteCrmContact(id);

    return NextResponse.json({ message: "Контактът е изтрит успешно" });
  } catch (error) {
    console.error("DELETE /api/admin/crm/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Грешка при изтриване на контакта" },
      { status: 500 }
    );
  }
}

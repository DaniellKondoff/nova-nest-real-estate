import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { bgPhoneRegex } from "@/lib/validations";
import { getCrmContacts, createCrmContact } from "@/lib/queries/crm";
import type { CrmContactStatus, CrmClientType } from "@/types/crm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Неоторизиран достъп" },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json(
        { error: "Нямате администраторски права" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as CrmContactStatus | null;
    const client_type = searchParams.get("client_type") as CrmClientType | null;
    const search = searchParams.get("search") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

    const contacts = await getCrmContacts({
      status: status ?? undefined,
      client_type: client_type ?? undefined,
      search,
    });

    return NextResponse.json({ contacts, page, limit });
  } catch (error) {
    console.error("GET /api/admin/crm/contacts error:", error);
    return NextResponse.json(
      { error: "Грешка при зареждане на контактите" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Неоторизиран достъп" },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json(
        { error: "Нямате администраторски права" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { full_name, phone } = body;

    if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
      return NextResponse.json(
        { error: "Полето 'Пълно име' е задължително" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Полето 'Телефон' е задължително" },
        { status: 400 }
      );
    }

    if (!bgPhoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { error: "Невалиден телефонен номер. Използвайте формат: +359 XX XXX XXXX или 08X XXX XXX" },
        { status: 400 }
      );
    }

    const contact = await createCrmContact({
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: body.email ?? null,
      budget_min: body.budget_min ?? null,
      budget_max: body.budget_max ?? null,
      budget_currency: body.budget_currency ?? "EUR",
      status: body.status ?? "active",
      client_types: Array.isArray(body.client_types) ? body.client_types : [],
      general_notes: body.general_notes ?? null,
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/crm/contacts error:", error);
    return NextResponse.json(
      { error: "Грешка при създаване на контакта" },
      { status: 500 }
    );
  }
}

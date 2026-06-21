import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getCrmActivities, createCrmActivity } from "@/lib/queries/crm";
import type { CrmActivityType } from "@/types/crm";

const VALID_ACTIVITY_TYPES: CrmActivityType[] = ["note", "call", "meeting"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });
    }

    const { id } = await params;
    const activities = await getCrmActivities(id);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("GET /api/admin/crm/contacts/[id]/activities error:", error);
    return NextResponse.json(
      { error: "Грешка при зареждане на активностите" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });
    }

    const { id: contactId } = await params;
    const body = await request.json();

    const { type, content, occurred_at } = body;

    if (!type || !VALID_ACTIVITY_TYPES.includes(type as CrmActivityType)) {
      return NextResponse.json(
        { error: "Невалиден тип активност. Допустими стойности: note, call, meeting" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Полето 'Съдържание' е задължително" },
        { status: 400 }
      );
    }

    if (!occurred_at || isNaN(Date.parse(occurred_at))) {
      return NextResponse.json(
        { error: "Полето 'Дата' е задължително и трябва да е валидна дата" },
        { status: 400 }
      );
    }

    const activity = await createCrmActivity({
      contact_id: contactId,
      type: type as CrmActivityType,
      content: content.trim(),
      outcome: body.outcome ?? null,
      occurred_at,
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/crm/contacts/[id]/activities error:", error);
    return NextResponse.json(
      { error: "Грешка при създаване на активността" },
      { status: 500 }
    );
  }
}

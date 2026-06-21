import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { updateCrmActivity, deleteCrmActivity } from "@/lib/queries/crm";
import type { CrmActivityType } from "@/types/crm";

const VALID_ACTIVITY_TYPES: CrmActivityType[] = ["note", "call", "meeting"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
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

    const { activityId } = await params;
    const body = await request.json();

    const update: Record<string, unknown> = {};

    if (body.type !== undefined) {
      if (!VALID_ACTIVITY_TYPES.includes(body.type as CrmActivityType)) {
        return NextResponse.json(
          { error: "Невалиден тип активност. Допустими стойности: note, call, meeting" },
          { status: 400 }
        );
      }
      update.type = body.type;
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string" || !body.content.trim()) {
        return NextResponse.json(
          { error: "Полето 'Съдържание' не може да е празно" },
          { status: 400 }
        );
      }
      update.content = body.content.trim();
    }

    if (body.outcome !== undefined) {
      update.outcome = body.outcome ?? null;
    }

    if (body.occurred_at !== undefined) {
      if (isNaN(Date.parse(body.occurred_at))) {
        return NextResponse.json({ error: "Невалидна дата" }, { status: 400 });
      }
      update.occurred_at = body.occurred_at;
    }

    const activity = await updateCrmActivity(activityId, update);
    return NextResponse.json({ activity });
  } catch (error) {
    console.error("PUT /api/admin/crm/contacts/[id]/activities/[activityId] error:", error);
    return NextResponse.json(
      { error: "Грешка при обновяване на активността" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
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

    const { activityId } = await params;
    await deleteCrmActivity(activityId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/crm/contacts/[id]/activities/[activityId] error:", error);
    return NextResponse.json(
      { error: "Грешка при изтриване на активността" },
      { status: 500 }
    );
  }
}

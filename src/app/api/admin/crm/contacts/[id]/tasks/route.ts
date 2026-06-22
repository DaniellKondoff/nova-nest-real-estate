import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getContactTasks, createTask } from "@/lib/queries/crm";
import type { CreateCrmTaskInput } from "@/types/crm";

const VALID_TASK_TYPES = ["call", "meeting", "follow_up", "other"] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles").select("role").eq("user_id", user.id).single();
  if (adminError || !adminProfile) return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });

  const { id: contactId } = await params;

  try {
    const tasks = await getContactTasks(contactId);
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks for contact:", err);
    return NextResponse.json({ error: "Грешка при зареждане на задачите" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles").select("role").eq("user_id", user.id).single();
  if (adminError || !adminProfile) return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });

  const { id: contactId } = await params;
  const body = await req.json();
  const { type, title, due_date } = body;

  if (!type || !(VALID_TASK_TYPES as readonly string[]).includes(type)) {
    return NextResponse.json({ error: "Невалиден тип задача" }, { status: 400 });
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Заглавието е задължително" }, { status: 400 });
  }
  if (!due_date || isNaN(Date.parse(due_date))) {
    return NextResponse.json({ error: "Невалидна дата" }, { status: 400 });
  }

  try {
    const input: CreateCrmTaskInput = {
      contact_id: contactId,
      type,
      title: title.trim(),
      due_date,
    };
    const task = await createTask(input);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("Error creating task:", err);
    return NextResponse.json({ error: "Грешка при създаване на задачата" }, { status: 500 });
  }
}

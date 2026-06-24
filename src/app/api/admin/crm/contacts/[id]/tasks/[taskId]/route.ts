import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { completeTask, reopenTask, deleteTask } from "@/lib/queries/crm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const supabase = await getServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles").select("role").eq("user_id", user.id).single();
  if (adminError || !adminProfile) return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });

  const { taskId } = await params;
  const body = await req.json();

  if (typeof body.is_done !== "boolean") {
    return NextResponse.json({ error: "Полето is_done е задължително (true/false)" }, { status: 400 });
  }

  try {
    const task = body.is_done ? await completeTask(taskId) : await reopenTask(taskId);
    return NextResponse.json(task);
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg?.code === "PGRST116") {
      return NextResponse.json({ error: "Задачата не е намерена" }, { status: 404 });
    }
    console.error("Error updating task:", err);
    return NextResponse.json({ error: "Грешка при обновяване на задачата" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const supabase = await getServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles").select("role").eq("user_id", user.id).single();
  if (adminError || !adminProfile) return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });

  const { taskId } = await params;

  try {
    await deleteTask(taskId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg?.code === "PGRST116") {
      return NextResponse.json({ error: "Задачата не е намерена" }, { status: 404 });
    }
    console.error("Error deleting task:", err);
    return NextResponse.json({ error: "Грешка при изтриване на задачата" }, { status: 500 });
  }
}

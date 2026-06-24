import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getTodaysTasks } from "@/lib/queries/crm";

export async function GET() {
  const supabase = await getServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles").select("role").eq("user_id", user.id).single();
  if (adminError || !adminProfile) return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });

  try {
    const tasks = await getTodaysTasks();
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("Error fetching today's tasks:", err);
    return NextResponse.json({ error: "Грешка при зареждане на задачите за днес" }, { status: 500 });
  }
}

import type { Database } from "@/types/database.generated";
import { getServerClient } from "@/lib/supabase/server";

export type AdminRole = "admin" | "agent" | "manager";

function normalizeRole(role: string | null | undefined): AdminRole | null {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === "admin" || r === "agent" || r === "manager") return r;
  return null;
}

export async function isAdminUserServer(): Promise<boolean> {
  const supabase = await getServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) return false;

  const { data, error } = await supabase
    .from("admin_profiles" satisfies keyof Database["public"]["Tables"]) // type-safety guard
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function getAdminRoleServer(): Promise<AdminRole | null> {
  const supabase = await getServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return null;
  return normalizeRole((data as { role?: string } | null)?.role);
}

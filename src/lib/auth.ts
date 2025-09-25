import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import { getSupabaseClient } from "@/lib/supabase";
import { getBrowserClient } from "@/lib/supabase";

export type AdminRole = "admin" | "agent" | "manager";

function normalizeRole(role: string | null | undefined): AdminRole | null {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === "admin" || r === "agent" || r === "manager") return r;
  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function isAdminUser(): Promise<boolean> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("admin_profiles" satisfies keyof Database["public"]["Tables"]) // type-safety guard
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function getAdminRole(): Promise<AdminRole | null> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return null;
  return normalizeRole((data as { role?: string } | null)?.role);
}

export type SignInResult = { success: true; user: User } | { success: false; error: string };

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  // Sign-in should run in the browser for proper cookie handling
  const supabase = typeof window !== "undefined" ? getBrowserClient() : getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Bulgarian-friendly messages
      const status = (error as any).status as number | undefined;
      if (status === 400 || status === 401) {
        return { success: false, error: "Невалидни данни за влизане." };
      }
      return { success: false, error: "Възникна грешка при влизане. Опитайте отново." };
    }
    if (!data.user) {
      return { success: false, error: "Възникна грешка при влизане. Опитайте отново." };
    }
    return { success: true, user: data.user };
  } catch (_e) {
    return { success: false, error: "Мрежова грешка. Проверете връзката и опитайте отново." };
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const supabase = typeof window !== "undefined" ? getBrowserClient() : getSupabaseClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: "Възникна грешка при излизане. Опитайте отново." };
    }
    return { success: true };
  } catch (_e) {
    return { success: false, error: "Мрежова грешка. Проверете връзката и опитайте отново." };
  }
}



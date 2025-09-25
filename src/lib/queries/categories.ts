import type { Database } from "@/types/database.generated";
import { getSupabaseClient } from "@/lib/supabase";

type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export async function getAllPropertyCategories(): Promise<CategoryRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("property_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error("Неуспешно зареждане на типове имоти.");
  return data ?? [];
}

export async function getPropertiesByCategory(categoryId: number): Promise<PropertyRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "available");
  if (error) throw new Error("Неуспешно зареждане на имоти по категория.");
  return data ?? [];
}



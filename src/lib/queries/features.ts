import type { Database } from "@/types/database.generated";
import { getSupabaseClient } from "@/lib/supabase";

type PropertyFeature = Database["public"]["Tables"]["property_features"]["Row"];

export async function getAllPropertyFeatures(): Promise<PropertyFeature[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("property_features")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  
  if (error) throw new Error("Неуспешно зареждане на характеристики.");
  return data ?? [];
}


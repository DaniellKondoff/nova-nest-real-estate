import type { Database } from "@/types/database.generated";
import { getBrowserClient } from "@/lib/supabase/client";

type PropertyFeature = Database["public"]["Tables"]["property_features"]["Row"];

export async function getAllPropertyFeatures(): Promise<PropertyFeature[]> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase
    .from("property_features")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  
  if (error) throw new Error("Неуспешно зареждане на характеристики.");
  return data ?? [];
}


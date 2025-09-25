import type { Database } from "@/types/database.generated";
import { getSupabaseClient } from "@/lib/supabase";

type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export async function getAllNeighborhoods(): Promise<NeighborhoodRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("name_bg", { ascending: true });
  if (error) throw new Error("Неуспешно зареждане на квартали.");
  return data ?? [];
}

export async function getNeighborhoodBySlug(slug: string): Promise<NeighborhoodRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("Кварталът не може да бъде зареден.");
  return data ?? null;
}

export async function getPropertiesInNeighborhood(neighborhoodId: number): Promise<PropertyRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("neighborhood_id", neighborhoodId)
    .eq("status", "available");
  if (error) throw new Error("Неуспешно зареждане на имоти по квартал.");
  return data ?? [];
}



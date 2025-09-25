import type { Database } from "@/types/database.generated";
import { getSupabaseClient } from "@/lib/supabase";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type ImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type OperationType = Database["public"]["Enums"]["property_operation_type"];
type PropertyStatus = Database["public"]["Enums"]["property_status"];

export type PropertyWithRelations = PropertyRow & {
  neighborhood?: Pick<NeighborhoodRow, "id" | "name_bg" | "slug"> | null;
  images?: ImageRow[] | null;
};

export async function getPublishedProperties(): Promise<PropertyRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "available" satisfies PropertyStatus);
  if (error) throw new Error("Неуспешно зареждане на имоти.");
  return data ?? [];
}

export async function getPropertyById(id: number): Promise<PropertyWithRelations | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "*, neighborhood:neighborhood_id(id,name_bg,slug), images:property_images(id,url,is_primary,sort_order,alt_text_bg)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Неуспешно зареждане на имот.");
  return (data as unknown as PropertyWithRelations) ?? null;
}

export type SearchFilters = {
  categoryId?: number;
  neighborhoodId?: number;
  operationType?: OperationType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
};

export async function searchProperties(
  searchTerm: string | undefined,
  filters: SearchFilters = {}
): Promise<{ id: number; title_bg: string; price_eur: number; rank: number }[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("search_properties_combined", {
    search_term: searchTerm || undefined,
    language_code: "bg",
    category_id: filters.categoryId,
    neighborhood_id: filters.neighborhoodId,
    operation_type: filters.operationType,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    min_area: filters.minArea,
    max_area: filters.maxArea,
  });
  if (error) throw new Error("Грешка при търсене. Опитайте отново.");
  return data ?? [];
}

export async function getFeaturedProperties(limit = 6, operationType?: OperationType): Promise<
  { id: number; title_bg: string; price_eur: number; neighborhood_name: string; primary_image_url: string }[]
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_featured_properties", {
    limit_count: limit,
    operation_type_filter: operationType,
  });
  if (error) throw new Error("Неуспешно зареждане на избрани имоти.");
  return data ?? [];
}



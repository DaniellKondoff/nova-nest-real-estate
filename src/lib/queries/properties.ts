import { getBrowserClient } from "@/lib/supabase/client";
import { getSupabaseClient } from "@/lib/supabase";
import type { PropertyWithDetails } from "@/types/property";
import type { Tables, Database } from "@/types/database.generated";

export type SearchFilters = {
  categoryId?: number;
  neighborhoodId?: number;
  operationType?: Database["public"]["Enums"]["property_operation_type"];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
};

export async function getPropertyById(id: number): Promise<PropertyWithDetails | null> {
  const supabase = getBrowserClient();
  
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      category:property_categories(*),
      neighborhood:neighborhoods(*),
      images:property_images(*),
      features:property_property_features(
        feature_id,
        feature:property_features(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }

  if (!data) return null;

  return {
    property: data,
    category: data.category,
    neighborhood: data.neighborhood,
    images: data.images || [],
    features: data.features?.map((f: any) => f.feature).filter(Boolean) || [],
  };
}

export async function getPublishedProperties(): Promise<Tables<"properties">[]> {
  const supabase = await getSupabaseClient();
  
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching published properties:", error);
    throw error;
  }

  return data || [];
}

export async function searchProperties(
  searchTerm?: string,
  filters: SearchFilters = {}
): Promise<Array<{ id: number; title_bg: string; price_eur: number; rank?: number }>> {
  const supabase = await getSupabaseClient();
  
  const { data, error } = await supabase.rpc("search_properties_combined", {
    search_term: searchTerm || undefined,
    language_code: "bg",
    category_id: filters.categoryId,
    neighborhood_id: filters.neighborhoodId,
    operation_type: filters.operationType as string | undefined,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    min_area: filters.minArea,
    max_area: filters.maxArea,
  });

  if (error) {
    console.error("Error searching properties:", error);
    throw error;
  }

  return (data as any) || [];
}

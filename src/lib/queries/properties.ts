import { getBrowserClient } from "@/lib/supabase/client";
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
  featureIds?: number[];
};

// Type for property row with basic relations (used in detail page fetching)
export type PropertyWithRelations = Tables<"properties"> & {
  images?: Tables<"property_images">[];
  features?: Tables<"property_features">[];
  neighborhood_id: number;
  category_id: number;
};

export async function getPropertyById(id: number): Promise<PropertyWithRelations | null> {
  const supabase = getBrowserClient();
  
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      images:property_images(*),
      features:property_property_features(
        feature_id,
        property_features(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }

  if (!data) return null;

  // Transform features data to match expected format
  const transformedFeatures = data.features?.map((pf: any) => pf.property_features).filter(Boolean) || [];

  // Return flat property with images and features attached
  return {
    ...data,
    images: data.images || [],
    features: transformedFeatures,
  } as PropertyWithRelations;
}

export async function getPublishedProperties(): Promise<Tables<"properties">[]> {
  const supabase = getBrowserClient();
  
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
  const supabase = getBrowserClient();
  
  try {
    // Try the RPC function first
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
      feature_ids: filters.featureIds,
    });

    if (error) {
      console.warn("RPC search failed, falling back to direct query:", error);
      return await searchPropertiesFallback(searchTerm, filters);
    }

    return (data as any) || [];
  } catch (error) {
    console.warn("RPC search failed, falling back to direct query:", error);
    return await searchPropertiesFallback(searchTerm, filters);
  }
}

/**
 * Fallback search method using direct Supabase queries
 * Used when the RPC function fails due to database issues
 */
export async function searchPropertiesFallback(
  searchTerm?: string,
  filters: SearchFilters = {}
): Promise<Array<{ id: number; title_bg: string; price_eur: number; rank?: number }>> {
  const supabase = getBrowserClient();
  
  let query = supabase
    .from("properties")
    .select("id, title_bg, description_bg, price_eur")
    .eq("status", "available");

  // Apply text search if provided
  if (searchTerm && searchTerm.trim()) {
    query = query.or(`title_bg.ilike.%${searchTerm}%,description_bg.ilike.%${searchTerm}%`);
  }

  // Apply category filter
  if (typeof filters.categoryId === "number") {
    query = query.eq("category_id", filters.categoryId);
  }

  // Apply neighborhood filter
  if (typeof filters.neighborhoodId === "number") {
    query = query.eq("neighborhood_id", filters.neighborhoodId);
  }

  // Apply operation type filter
  if (filters.operationType) {
    query = query.eq("operation_type", filters.operationType);
  }

  // Apply price filters
  if (typeof filters.minPrice === "number") {
    query = query.gte("price_eur", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("price_eur", filters.maxPrice);
  }

  // Apply area filters
  if (typeof filters.minArea === "number") {
    query = query.gte("area_sqm", filters.minArea);
  }
  if (typeof filters.maxArea === "number") {
    query = query.lte("area_sqm", filters.maxArea);
  }

  // Note: Feature filtering will be handled after the main query
  // due to the complexity of the many-to-many relationship

  // Order by creation date (newest first)
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Fallback search failed:", error);
    throw error;
  }

  let filteredData = data || [];

  // Apply feature filtering if needed
  if (filters.featureIds && filters.featureIds.length > 0) {
    // Get property IDs that have the required features
    const { data: featureData, error: featureError } = await supabase
      .from("property_property_features")
      .select("property_id")
      .in("feature_id", filters.featureIds);

    if (featureError) {
      console.warn("Feature filtering failed:", featureError);
    } else {
      const propertyIdsWithFeatures = new Set(
        (featureData || []).map((item) => item.property_id)
      );
      
      // Filter properties to only include those with the required features
      filteredData = filteredData.filter((item) => 
        propertyIdsWithFeatures.has(item.id)
      );
    }
  }

  // Transform to match expected format with rank
  return filteredData.map((item, index) => ({
    id: item.id,
    title_bg: item.title_bg,
    price_eur: item.price_eur || 0,
    rank: index + 1, // Simple rank based on order
  }));
}

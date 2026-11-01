import { getBrowserClient } from "@/lib/supabase/client";
import type { PropertyWithDetails } from "@/types/property";
import type { Tables, Database } from "@/types/database.generated";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Any Supabase client for our schema (browser, server or static) */
type DbClient = SupabaseClient<Database>;

/** Strip characters that carry meaning inside PostgREST filter strings (e.g. .or()) */
function sanitizeFilterTerm(term: string): string {
  return term.replace(/[,()*%\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

export type SearchFilters = {
  categoryId?: number;
  neighborhoodId?: number;
  operationType?: Database["public"]["Enums"]["property_operation_type"];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  /** Room counts; 4 means "4 or more" */
  rooms?: number[];
  minBedrooms?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  /** The property must have ALL of these features */
  featureIds?: number[];
};

/** Listings flagged new or created within this many days count as "Ново" (same rule as the card badge) */
const NEW_LISTING_DAYS = 7;

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
  filters: SearchFilters = {},
  client?: DbClient
): Promise<Array<{ id: number; title_bg: string; price_eur: number; rank?: number }>> {
  const supabase: DbClient = client ?? (getBrowserClient() as unknown as DbClient);

  try {
    // All filters (incl. rooms and ALL-of features) run in Postgres – scripts/migrations/015_create_search_properties_v3.sql
    // @ts-expect-error - RPC function not in generated types yet
    const { data, error } = await supabase.rpc("search_properties_v3", {
      p_search_term: searchTerm || undefined,
      p_language_code: "bg",
      p_category_id: filters.categoryId,
      p_neighborhood_id: filters.neighborhoodId,
      p_operation_type: filters.operationType as string | undefined,
      p_min_price: filters.minPrice,
      p_max_price: filters.maxPrice,
      p_min_area: filters.minArea,
      p_max_area: filters.maxArea,
      p_rooms: filters.rooms?.length ? filters.rooms : undefined,
      p_min_bedrooms: filters.minBedrooms,
      p_is_new: filters.isNew,
      p_is_featured: filters.isFeatured,
      p_feature_ids: filters.featureIds?.length ? filters.featureIds : undefined,
    });

    if (error) {
      console.warn("RPC search failed, falling back to direct query:", error);
      return await searchPropertiesFallback(searchTerm, filters, client);
    }

    return (data as any) || [];
  } catch (error) {
    console.warn("RPC search failed, falling back to direct query:", error);
    return await searchPropertiesFallback(searchTerm, filters, client);
  }
}

/**
 * Fallback search method using direct Supabase queries
 * Used when the RPC function fails due to database issues
 */
export async function searchPropertiesFallback(
  searchTerm?: string,
  filters: SearchFilters = {},
  client?: DbClient
): Promise<Array<{ id: number; title_bg: string; price_eur: number; rank?: number }>> {
  const supabase: DbClient = client ?? (getBrowserClient() as unknown as DbClient);

  let query = supabase
    .from("properties")
    .select("id, title_bg, description_bg, price_eur")
    .eq("status", "available");

  // Apply text search if provided (sanitized: the term is embedded in a PostgREST filter string)
  const safeTerm = searchTerm ? sanitizeFilterTerm(searchTerm) : "";
  if (safeTerm) {
    query = query.or(`title_bg.ilike.%${safeTerm}%,description_bg.ilike.%${safeTerm}%`);
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

  // Rooms: exact values, 4 = "4 or more" (only validated integers reach the filter string)
  const rooms = (filters.rooms ?? []).filter((r) => Number.isInteger(r) && r >= 1 && r <= 4);
  if (rooms.length > 0) {
    const exact = rooms.filter((r) => r < 4);
    const parts = [
      ...(exact.length > 0 ? [`rooms.in.(${exact.join(",")})`] : []),
      ...(rooms.includes(4) ? ["rooms.gte.4"] : []),
    ];
    query = query.or(parts.join(","));
  }

  if (typeof filters.minBedrooms === "number") {
    query = query.gte("bedrooms", filters.minBedrooms);
  }
  if (typeof filters.isFeatured === "boolean") {
    query = query.eq("is_featured", filters.isFeatured);
  }
  if (typeof filters.isNew === "boolean") {
    const since = new Date(Date.now() - NEW_LISTING_DAYS * 24 * 60 * 60 * 1000).toISOString();
    query = filters.isNew
      ? query.or(`is_new.eq.true,created_at.gte.${since}`)
      : query.eq("is_new", false).lt("created_at", since);
  }

  // Order by creation date (newest first)
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Fallback search failed:", error);
    throw error;
  }

  let filteredData = data || [];

  // Features: keep only properties that have ALL selected features.
  // The join rows are scoped to the candidate ids, so this never loads the whole table.
  const featureIds = Array.from(new Set(filters.featureIds ?? []));
  if (featureIds.length > 0 && filteredData.length > 0) {
    const { data: featureData, error: featureError } = await supabase
      .from("property_property_features")
      .select("property_id, feature_id")
      .in("property_id", filteredData.map((item) => item.id))
      .in("feature_id", featureIds);

    if (featureError) {
      console.error("Feature filtering failed:", featureError);
      throw featureError;
    }

    const featuresByProperty = new Map<number, Set<number>>();
    (featureData || []).forEach(({ property_id, feature_id }) => {
      const set = featuresByProperty.get(property_id) ?? new Set<number>();
      set.add(feature_id);
      featuresByProperty.set(property_id, set);
    });
    filteredData = filteredData.filter((item) => (featuresByProperty.get(item.id)?.size ?? 0) === featureIds.length);
  }

  // Transform to match expected format with rank
  return filteredData.map((item, index) => ({
    id: item.id,
    title_bg: item.title_bg,
    price_eur: item.price_eur || 0,
    rank: index + 1, // Simple rank based on order
  }));
}

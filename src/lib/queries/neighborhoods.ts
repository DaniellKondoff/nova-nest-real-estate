import { getBrowserClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.generated";
import type { PropertyWithDetails } from "@/types/property";

type NeighborhoodsRow = Tables<'neighborhoods'>;

/**
 * Neighborhood interface for the application
 * Extends the database row with additional computed properties
 */
export interface Neighborhood extends NeighborhoodsRow {
}

/**
 * Get all neighborhoods from the database
 * @returns Promise<Neighborhood[]> - Array of neighborhoods ordered by name_bg
 */
export async function getAllNeighborhoods(): Promise<Neighborhood[]> {
  const supabase = getBrowserClient();
  
  const { data, error } = await supabase
    .from("neighborhoods")
    .select(`
      id,
      name_bg,
      name_en,
      slug,
      description,
      center_lat,
      center_lng,
      amenities,
      transport_info,
      seo_title,
      seo_description,
      seo_keywords
    `)
    .order("name_bg", { ascending: true });

  if (error) {
    console.error("Error fetching active neighborhoods:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single neighborhood by its slug
 * @param slug - The neighborhood slug
 * @returns Promise<Neighborhood | null> - The neighborhood or null if not found
 */
export async function getNeighborhoodBySlug(slug: string): Promise<Neighborhood | null> {
  const supabase = getBrowserClient();
  
  const { data, error } = await supabase
    .from("neighborhoods")
    .select(`
      id,
      name_bg,
      name_en,
      slug,
      description,
      center_lat,
      center_lng,
      amenities,
      transport_info,
      seo_title,
      seo_description,
      seo_keywords
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error("Error fetching neighborhood by slug:", error);
    throw error;
  }

  return data;
}

/**
 * Get properties in a specific neighborhood
 * @param neighborhoodId - The neighborhood ID
 * @param limit - Maximum number of properties to return (default: 20)
 * @returns Promise<PropertyWithDetails[]> - Array of properties in the neighborhood
 */
export async function getPropertiesByNeighborhood(
  neighborhoodId: number, 
  limit: number = 20
): Promise<PropertyWithDetails[]> {
  const supabase = getBrowserClient();
  
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      images:property_images(*),
      features:property_property_features(
        feature_id,
        property_features(*)
      ),
      neighborhood:neighborhoods(*),
      category:property_categories(*)
    `)
    .eq("neighborhood_id", neighborhoodId)
    .eq("status", "available")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching properties by neighborhood:", error);
    throw error;
  }

  if (!data) return [];

  // Transform the data to match PropertyWithDetails interface
  return data.map((property: any) => {
    const transformedFeatures = property.features?.map((pf: any) => pf.property_features).filter(Boolean) || [];
    
    return {
      property: property,
      neighborhood: property.neighborhood,
      category: property.category,
      images: property.images || [],
      features: transformedFeatures,
    } as PropertyWithDetails;
  });
}

/**
 * Get the count of available properties in a neighborhood
 * @param neighborhoodId - The neighborhood ID
 * @returns Promise<number> - Count of available properties
 */
export async function getPropertyCountByNeighborhood(neighborhoodId: number): Promise<number> {
  const supabase = getBrowserClient();
  
  const { count, error } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("neighborhood_id", neighborhoodId)
    .eq("status", "available")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching property count by neighborhood:", error);
    throw error;
  }

  return count || 0;
}
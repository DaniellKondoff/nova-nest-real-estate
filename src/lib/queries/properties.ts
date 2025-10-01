import { getBrowserClient } from "@/lib/supabase/client";
import type { PropertyWithDetails } from "@/types/property";

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

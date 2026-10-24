import { cache } from "react";
import { notFound } from "next/navigation";
import { getStaticServerClient } from "@/lib/supabase/server";
import { extractPropertyId, isValidPropertySlug } from "@/lib/seo/property-slug";
import type { PropertyWithDetails } from "@/types/property";
import type { Database } from "@/types/database.generated";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];
type ImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type FeatureRow = Database["public"]["Tables"]["property_features"]["Row"];

const DETAIL_SELECT = `
  id, slug, title_bg, description_bg, operation_type, status, price_eur, price_bgn,
  area_sqm, rooms, bedrooms, bathrooms, floor, total_floors, year_built, address_bg,
  latitude, longitude, is_new, is_featured, neighborhood_id, category_id, created_at, updated_at,
  seo_title, seo_description, seo_keywords, og_image,
  neighborhood:neighborhoods(id, name_bg, slug, description, amenities),
  category:property_categories(id, name_bg, slug),
  images:property_images(id, url, is_primary, sort_order, alt_text_bg, width, height),
  features:property_property_features(property_features(id, name_bg, category))
`;

/**
 * Validate ID format and extract property ID
 * Supports both formats:
 * - Old format: "11" (numeric only)
 * - New format: "11-apartamenti-3-stai-centur" (ID-slug)
 */
export function validateIdOrNotFound(idParam: string): number {
  if (idParam.includes("-")) {
    if (!isValidPropertySlug(idParam)) notFound();
    const id = extractPropertyId(idParam);
    if (!id) notFound();
    return id;
  }
  if (!/^\d+$/.test(idParam)) notFound();
  const idNum = Number(idParam);
  if (!Number.isFinite(idNum) || idNum <= 0) notFound();
  return idNum;
}

/** Deduplicated per request (generateMetadata + page share one query) */
export const fetchPropertyDetails = cache(async (idNum: number): Promise<PropertyWithDetails | null> => {
  const supabase = getStaticServerClient();
  const { data, error } = await supabase.from("properties").select(DETAIL_SELECT).eq("id", idNum).maybeSingle();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as Record<string, unknown> & {
    neighborhood?: NeighborhoodRow | null;
    category?: CategoryRow | null;
    images?: ImageRow[] | null;
    features?: Array<{ property_features: FeatureRow | null }> | null;
  };

  return {
    property: row as unknown as PropertyRow,
    neighborhood: row.neighborhood ? { ...row.neighborhood, name_bg: row.neighborhood.name_bg.trim() } : null,
    category: row.category ?? null,
    images: row.images ?? [],
    features: (row.features ?? []).map((pf) => pf.property_features).filter((f): f is FeatureRow => Boolean(f)),
  };
});

import type { Database } from "@/types/database.generated";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

/**
 * Builds the source text used to generate a property embedding.
 * Pass pre-fetched category and neighborhood display names to avoid N+1 queries.
 */
export function buildPropertyEmbeddingText(
  property: PropertyRow,
  categoryName: string,
  neighborhoodName: string
): string {
  const parts: string[] = [];

  if (property.title_bg) parts.push(property.title_bg);
  if (property.description_bg) parts.push(property.description_bg);
  if (property.address_bg) parts.push(property.address_bg);
  if (categoryName) parts.push(categoryName);
  if (neighborhoodName) parts.push(neighborhoodName);
  if (property.rooms != null) parts.push(`${property.rooms} стаи`);
  if (property.area_sqm != null) parts.push(`${property.area_sqm} кв.м`);
  if (property.operation_type) parts.push(property.operation_type);

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Builds the source text used to generate a neighborhood embedding.
 */
export function buildNeighborhoodEmbeddingText(neighborhood: NeighborhoodRow): string {
  const parts: string[] = [];

  if (neighborhood.name_bg) parts.push(neighborhood.name_bg);
  if (neighborhood.description) parts.push(neighborhood.description);
  if (neighborhood.seo_description) parts.push(neighborhood.seo_description);
  if (neighborhood.seo_keywords) parts.push(neighborhood.seo_keywords);

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

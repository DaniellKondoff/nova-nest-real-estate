import { generateEmbedding } from "@/lib/embeddings/openai";
import { getServiceClient } from "@/lib/supabase/service";
import type { ExtractedFilters } from "./filters";

const MIN_PROPERTY_SIMILARITY = 0.15;
const MIN_NEIGHBORHOOD_SIMILARITY = 0.10;

// ============================================================================
// Types
// ============================================================================

export interface SemanticSearchFilters extends ExtractedFilters {
  categoryId?:     number;
  neighborhoodId?: number;
}

export interface SemanticPropertyResult {
  propertyId:     number;
  similarity:     number;
  priceEur:       number | null;
  priceBgn:       number | null;
  areaSqm:        number | null;
  rooms:          number | null;
  bedrooms:       number | null;
  categoryId:     number;
  neighborhoodId: number;
  operationType:  "sale" | "rent";
  isFeatured:     boolean;
}

export interface SemanticNeighborhoodResult {
  neighborhoodId: number;
  similarity:     number;
  nameBg:         string;
  slug:           string;
}

// ============================================================================
// Property search
// ============================================================================

/**
 * Search properties by cosine similarity. Returns [] on any error — never throws.
 */
export async function searchProperties(
  embedding: number[],
  filters?: SemanticSearchFilters,
  topK = 10
): Promise<SemanticPropertyResult[]> {
  try {
    const supabase = getServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("match_properties", {
      query_embedding:        embedding,
      match_count:            topK,
      filter_operation_type:  filters?.operationType  ?? null,
      filter_category_id:     filters?.categoryId     ?? null,
      filter_neighborhood_id: filters?.neighborhoodId ?? null,
      filter_min_price:       filters?.minPriceEur    ?? null,
      filter_max_price:       filters?.maxPriceEur    ?? null,
      filter_min_area:        filters?.minAreaSqm     ?? null,
      filter_max_area:        filters?.maxAreaSqm     ?? null,
      filter_min_rooms:       filters?.minRooms       ?? null,
      filter_max_rooms:       filters?.maxRooms       ?? null,
    });

    if (error || !data) {
      console.warn("[semantic-search] match_properties error:", error?.message);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[])
      .map((row) => ({
        propertyId:     row.property_id as number,
        similarity:     row.similarity as number,
        priceEur:       row.price_eur as number | null,
        priceBgn:       row.price_bgn as number | null,
        areaSqm:        row.area_sqm as number | null,
        rooms:          row.rooms as number | null,
        bedrooms:       row.bedrooms as number | null,
        categoryId:     row.category_id as number,
        neighborhoodId: row.neighborhood_id as number,
        operationType:  row.operation_type as "sale" | "rent",
        isFeatured:     row.is_featured as boolean,
      }))
      .filter((r) => r.similarity >= MIN_PROPERTY_SIMILARITY);
  } catch (err) {
    console.error("[semantic-search] searchProperties unexpected error:", err);
    return [];
  }
}

// ============================================================================
// Neighborhood search
// ============================================================================

/**
 * Search neighborhoods by cosine similarity. Returns [] on any error — never throws.
 */
export async function searchNeighborhoods(
  embedding: number[],
  topK = 5
): Promise<SemanticNeighborhoodResult[]> {
  try {
    const supabase = getServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("match_neighborhoods", {
      query_embedding: embedding,
      match_count:     topK,
    });

    if (error || !data) {
      console.warn("[semantic-search] match_neighborhoods error:", error?.message);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[])
      .map((row) => ({
        neighborhoodId: row.neighborhood_id as number,
        similarity:     row.similarity as number,
        nameBg:         row.name_bg as string,
        slug:           row.slug as string,
      }))
      .filter((r) => r.similarity >= MIN_NEIGHBORHOOD_SIMILARITY);
  } catch (err) {
    console.error("[semantic-search] searchNeighborhoods unexpected error:", err);
    return [];
  }
}

// ============================================================================
// Combined parallel search
// ============================================================================

/**
 * Embeds the query once, then runs property and neighborhood searches in
 * parallel via Promise.all. Never throws — returns empty arrays on any failure.
 */
export async function semanticSearch(
  query: string,
  filters?: SemanticSearchFilters,
  topK = 10
): Promise<{ properties: SemanticPropertyResult[]; neighborhoods: SemanticNeighborhoodResult[] }> {
  let embedding: number[];

  try {
    embedding = await generateEmbedding(query);
  } catch (err) {
    console.error("[semantic-search] generateEmbedding failed:", err);
    return { properties: [], neighborhoods: [] };
  }

  const [properties, neighborhoods] = await Promise.all([
    searchProperties(embedding, filters, topK),
    searchNeighborhoods(embedding, Math.min(topK, 5)),
  ]);

  return { properties, neighborhoods };
}

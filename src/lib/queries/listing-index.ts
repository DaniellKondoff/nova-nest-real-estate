import { unstable_cache } from "next/cache";
import { getStaticServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.generated";

export const LISTINGS_CACHE_TAG = "listings";

/** Lightweight facts about one available listing – enough for sitemaps, counts and price stats */
export interface ListingIndexEntry {
  id: number;
  slug: string | null;
  updatedAt: string | null;
  operationType: Database["public"]["Enums"]["property_operation_type"];
  categoryId: number | null;
  neighborhoodId: number | null;
  priceEur: number | null;
  areaSqm: number | null;
  primaryImageUrl: string | null;
}

type IndexRow = {
  id: number;
  slug: string | null;
  updated_at: string | null;
  operation_type: ListingIndexEntry["operationType"];
  category_id: number | null;
  neighborhood_id: number | null;
  price_eur: number | null;
  area_sqm: number | null;
  images: Array<{ url: string; is_primary: boolean | null; sort_order: number | null }> | null;
};

/**
 * All available listings in one small query (the agency has tens of listings, not thousands).
 * Shared by the sitemap, landing-page facets and neighborhood indexability checks.
 */
export const getCachedListingIndex = unstable_cache(
  async (): Promise<ListingIndexEntry[]> => {
    const supabase = getStaticServerClient();
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, slug, updated_at, operation_type, category_id, neighborhood_id, price_eur, area_sqm, images:property_images(url, is_primary, sort_order)"
      )
      .eq("status", "available")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Неуспешно зареждане на обявите: ${error.message}`);

    return ((data ?? []) as unknown as IndexRow[]).map((row) => {
      const images = [...(row.images ?? [])].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      return {
        id: row.id,
        slug: row.slug,
        updatedAt: row.updated_at,
        operationType: row.operation_type,
        categoryId: row.category_id,
        neighborhoodId: row.neighborhood_id,
        priceEur: row.price_eur,
        areaSqm: row.area_sqm,
        primaryImageUrl: images[0]?.url ?? null,
      };
    });
  },
  ["listing-index"],
  { tags: [LISTINGS_CACHE_TAG], revalidate: 3600 }
);

/** Number of available listings per neighborhood id */
export function countByNeighborhood(listings: ListingIndexEntry[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const l of listings) {
    if (l.neighborhoodId != null) counts.set(l.neighborhoodId, (counts.get(l.neighborhoodId) ?? 0) + 1);
  }
  return counts;
}

export interface ListingStats {
  total: number;
  sale: number;
  rent: number;
  /** Neighborhoods and villages with at least one available listing */
  neighborhoods: number;
}

/** Live counts for trust stats on the home page (zeros when the index can't be loaded) */
export async function getListingStats(): Promise<ListingStats> {
  const listings = await getCachedListingIndex().catch(() => [] as ListingIndexEntry[]);
  const rent = listings.filter((l) => l.operationType === "rent").length;
  return {
    total: listings.length,
    sale: listings.length - rent,
    rent,
    neighborhoods: countByNeighborhood(listings).size,
  };
}

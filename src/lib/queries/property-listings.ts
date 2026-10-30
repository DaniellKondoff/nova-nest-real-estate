import { unstable_cache } from "next/cache";
import type { PropertySearchFilters, PropertyWithDetails } from "@/types/property";
import type { SortOption } from "@/types/search";
import { getStaticServerClient } from "@/lib/supabase/server";
import { searchProperties, searchPropertiesFallback } from "@/lib/queries/properties";
import { LISTING_SELECT } from "@/lib/queries/listing-select";
import { LISTINGS_CACHE_TAG } from "@/lib/queries/listing-index";

/**
 * Server-side property listing search shared by the /properties page (SSR)
 * and the POST /api/properties/search route.
 */

export interface PropertyListingResult {
  properties: PropertyWithDetails[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

function sortToOrder(sort: SortOption | undefined): { column: string; ascending: boolean } {
  switch (sort) {
    case "oldest":
      return { column: "created_at", ascending: true };
    case "price_asc":
      return { column: "price_eur", ascending: true };
    case "price_desc":
      return { column: "price_eur", ascending: false };
    case "area_asc":
      return { column: "area_sqm", ascending: true };
    case "area_desc":
      return { column: "area_sqm", ascending: false };
    default:
      return { column: "created_at", ascending: false };
  }
}

function hasSearchCriteria(filters: PropertySearchFilters): boolean {
  return Boolean(
    filters.searchTerm ||
      typeof filters.categoryId === "number" ||
      typeof filters.neighborhoodId === "number" ||
      typeof filters.minPriceEur === "number" ||
      typeof filters.maxPriceEur === "number" ||
      typeof filters.minArea === "number" ||
      typeof filters.maxArea === "number" ||
      filters.operationType ||
      (filters.rooms && filters.rooms.length > 0) ||
      typeof filters.minBedrooms === "number" ||
      typeof filters.isNew === "boolean" ||
      typeof filters.isFeatured === "boolean" ||
      (filters.featureIds && filters.featureIds.length > 0)
  );
}

function mapRow(row: unknown): PropertyWithDetails {
  const r = row as Record<string, unknown> & {
    neighborhood?: PropertyWithDetails["neighborhood"];
    category?: PropertyWithDetails["category"];
    images?: PropertyWithDetails["images"] | null;
  };
  const images = [...(r.images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  return {
    property: row as PropertyWithDetails["property"],
    neighborhood: r.neighborhood ?? null,
    category: r.category ?? null,
    images,
  };
}

export async function searchPropertyListings(
  filters: PropertySearchFilters,
  page: number,
  limit: number
): Promise<PropertyListingResult> {
  const supabase = getStaticServerClient();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const requestedPage = Math.max(1, Math.floor(page));
  const order = sortToOrder(filters.sort);

  let pageIds: number[] = [];
  let total = 0;

  if (hasSearchCriteria(filters)) {
    const queryFilters = {
      categoryId: filters.categoryId,
      neighborhoodId: filters.neighborhoodId,
      operationType: filters.operationType,
      minPrice: filters.minPriceEur,
      maxPrice: filters.maxPriceEur,
      minArea: filters.minArea,
      maxArea: filters.maxArea,
      rooms: filters.rooms,
      minBedrooms: filters.minBedrooms,
      isNew: filters.isNew,
      isFeatured: filters.isFeatured,
      featureIds: filters.featureIds,
    };

    let matches: Array<{ id: number }>;
    try {
      matches = await searchProperties(filters.searchTerm, queryFilters, supabase);
    } catch {
      matches = await searchPropertiesFallback(filters.searchTerm, queryFilters, supabase);
    }
    const matchedIds = matches.map((m) => Number(m.id)).filter(Number.isFinite);

    if (matchedIds.length > 0) {
      // Sort the full match set in the DB *before* paginating (not just within one page)
      const { data: sortedRows, error } = await supabase
        .from("properties")
        .select("id")
        .in("id", matchedIds)
        .eq("status", "available")
        .order(order.column, { ascending: order.ascending, nullsFirst: false })
        .order("id", { ascending: false });
      if (error) throw new Error("Грешка при извличане на данни");

      const sortedIds = (sortedRows ?? []).map((r) => Number(r.id));
      total = sortedIds.length;
      const totalPagesForMatches = Math.max(1, Math.ceil(total / safeLimit));
      const clamped = Math.min(requestedPage, totalPagesForMatches);
      pageIds = sortedIds.slice((clamped - 1) * safeLimit, clamped * safeLimit);
    }
  } else {
    const { data: rows, count, error } = await supabase
      .from("properties")
      .select("id", { count: "exact" })
      .eq("status", "available")
      .order(order.column, { ascending: order.ascending, nullsFirst: false })
      .order("id", { ascending: false })
      .range((requestedPage - 1) * safeLimit, requestedPage * safeLimit - 1);

    if (error?.code === "PGRST103") {
      // Requested page is past the end – return an empty page with the real total
      const { count: totalCount } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "available");
      total = totalCount ?? 0;
    } else if (error) {
      throw new Error("Грешка при извличане на данни");
    } else {
      total = count ?? 0;
      pageIds = (rows ?? []).map((r) => Number(r.id)).filter(Number.isFinite);
    }
  }

  const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
  const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  let properties: PropertyWithDetails[] = [];
  if (pageIds.length > 0) {
    const { data, error } = await supabase.from("properties").select(LISTING_SELECT).in("id", pageIds);
    if (error) throw new Error("Грешка при извличане на данни");

    // Preserve the sorted id order from the paging step
    const byId = new Map((data ?? []).map((row) => [Number((row as unknown as { id: number }).id), row]));
    properties = pageIds.map((id) => byId.get(id)).filter(Boolean).map(mapRow);
  }

  return {
    properties,
    total,
    page: currentPage,
    totalPages,
    hasMore: totalPages > 0 && currentPage < totalPages,
  };
}

/** Newest available listings for the home page, purged with the other listing caches by revalidatePublicPages() */
export const getCachedLatestListings = unstable_cache(
  async (limit: number): Promise<Pick<PropertyListingResult, "properties" | "total">> => {
    const { properties, total } = await searchPropertyListings({}, 1, limit);
    return { properties, total };
  },
  ["latest-listings"],
  { tags: [LISTINGS_CACHE_TAG], revalidate: 3600 }
);

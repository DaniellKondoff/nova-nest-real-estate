import { cache } from "react";
import { getCachedListingIndex } from "@/lib/queries/listing-index";
import { getCachedPropertyCategories } from "@/lib/queries/categories";
import { getCachedNeighborhoods, type Neighborhood } from "@/lib/queries/neighborhoods";
import { toLandingCategories, type LandingCategory } from "@/lib/seo/landing";
import type { ListingIndexEntry } from "@/lib/queries/listing-index";

export interface LandingData {
  categories: LandingCategory[];
  neighborhoods: Neighborhood[];
  listings: ListingIndexEntry[];
}

/** Everything a landing page needs to resolve its URL, count listings and build related links (per request) */
export const getLandingData = cache(async (): Promise<LandingData> => {
  const [categories, neighborhoods, listings] = await Promise.all([
    getCachedPropertyCategories(),
    getCachedNeighborhoods(),
    getCachedListingIndex(),
  ]);
  return { categories: toLandingCategories(categories), neighborhoods, listings };
});

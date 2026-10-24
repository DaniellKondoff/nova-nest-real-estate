/**
 * Keyword landing pages – clean, indexable URLs for the searches people actually make:
 *   /imoti-za-prodazhba/              "имоти за продажба Стара Загора"
 *   /imoti-za-prodazhba/apartamenti/  "апартаменти за продажба Стара Загора"
 *   /{квартал}/apartamenti/           "апартаменти Казански"
 * The filterable /properties/ page canonicalizes to these URLs when its filters match one exactly.
 */

import type { PropertySearchFilters } from "@/types/search";
import type { ListingIndexEntry } from "@/lib/queries/listing-index";

export type OperationType = "sale" | "rent";

export const OPERATION_LANDINGS: Record<OperationType, { slug: string; label: string; title: string }> = {
  sale: { slug: "imoti-za-prodazhba", label: "за продажба", title: "Имоти за продажба" },
  rent: { slug: "imoti-pod-naem", label: "под наем", title: "Имоти под наем" },
};

/** DB category slugs are singular transliterations – landing URLs use the plural people search for */
const CATEGORY_LANDING_NAMES: Record<string, { slug: string; plural: string }> = {
  apartament: { slug: "apartamenti", plural: "Апартаменти" },
  kshta: { slug: "kashti", plural: "Къщи" },
  ofis: { slug: "ofisi", plural: "Офиси" },
  garazh: { slug: "garazhi", plural: "Гаражи" },
  parcel: { slug: "parceli", plural: "Парцели" },
  sklad: { slug: "skladove", plural: "Складове" },
};

export interface LandingCategory {
  id: number;
  /** URL segment, e.g. "apartamenti" */
  slug: string;
  /** "Апартаменти" */
  plural: string;
}

export interface LandingNeighborhood {
  id: number;
  slug: string;
  name_bg: string;
}

export function toLandingCategories(categories: Array<{ id: number; slug: string; name_bg: string }>): LandingCategory[] {
  return categories.map((c) => ({
    id: c.id,
    slug: CATEGORY_LANDING_NAMES[c.slug]?.slug ?? c.slug,
    plural: CATEGORY_LANDING_NAMES[c.slug]?.plural ?? c.name_bg,
  }));
}

export function operationPath(operation: OperationType): string {
  return `/${OPERATION_LANDINGS[operation].slug}/`;
}

export function operationCategoryPath(operation: OperationType, category: LandingCategory): string {
  return `/${OPERATION_LANDINGS[operation].slug}/${category.slug}/`;
}

export function neighborhoodPath(neighborhood: LandingNeighborhood): string {
  return `/${neighborhood.slug}/`;
}

export function neighborhoodCategoryPath(neighborhood: LandingNeighborhood, category: LandingCategory): string {
  return `/${neighborhood.slug}/${category.slug}/`;
}

/**
 * The landing URL whose listing set equals these filters, or null when the combination has no landing page
 * (price/area ranges, features, search, non-default sort, or operation + neighborhood).
 */
export function landingPathFor(
  filters: PropertySearchFilters,
  categories: LandingCategory[],
  neighborhoods: LandingNeighborhood[]
): string | null {
  const { operationType, categoryId, neighborhoodId, sort, ...rest } = filters;
  const hasOther = Object.values(rest).some((v) => (Array.isArray(v) ? v.length > 0 : v != null));
  if (hasOther || (sort && sort !== "newest")) return null;

  const category = categoryId != null ? categories.find((c) => c.id === categoryId) : undefined;
  const neighborhood = neighborhoodId != null ? neighborhoods.find((n) => n.id === neighborhoodId) : undefined;
  if ((categoryId != null && !category) || (neighborhoodId != null && !neighborhood)) return null;

  if (neighborhood && !operationType) return category ? neighborhoodCategoryPath(neighborhood, category) : neighborhoodPath(neighborhood);
  if (operationType && !neighborhood) return category ? operationCategoryPath(operationType, category) : operationPath(operationType);
  return null;
}

/** Listings matching a landing scope */
export function filterListings(
  listings: ListingIndexEntry[],
  scope: { operationType?: OperationType; categoryId?: number; neighborhoodId?: number }
): ListingIndexEntry[] {
  return listings.filter(
    (l) =>
      (scope.operationType == null || l.operationType === scope.operationType) &&
      (scope.categoryId == null || l.categoryId === scope.categoryId) &&
      (scope.neighborhoodId == null || l.neighborhoodId === scope.neighborhoodId)
  );
}

export interface ListingStats {
  count: number;
  minPrice: number | null;
  medianPrice: number | null;
  /** Only for sale listings – rent per m² is not a meaningful market figure */
  medianPricePerSqm: number | null;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return Math.round(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
}

export function computeListingStats(listings: ListingIndexEntry[]): ListingStats {
  const prices = listings.map((l) => l.priceEur).filter((p): p is number => typeof p === "number" && p > 0);
  const perSqm = listings
    .filter((l) => l.operationType === "sale" && l.priceEur && l.areaSqm && l.areaSqm > 0)
    .map((l) => (l.priceEur as number) / (l.areaSqm as number));
  return {
    count: listings.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    medianPrice: median(prices),
    medianPricePerSqm: median(perSqm),
  };
}

/** "1 обява" / "5 обяви" */
export function listingCountLabel(count: number): string {
  return count === 1 ? "1 обява" : `${count} обяви`;
}

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

/** Landing slug of the apartment category – the only category with room-count landing pages */
export const APARTMENT_LANDING_SLUG = CATEGORY_LANDING_NAMES.apartament.slug;

/** Room-count buckets, matching the rooms filter: 4 means "4 or more" */
export type RoomCount = 1 | 2 | 3 | 4;
export const ROOM_COUNTS: RoomCount[] = [1, 2, 3, 4];

/** "двустайни апартаменти Стара Загора" – how Bulgarians search for apartments */
export const ROOM_LANDINGS: Record<RoomCount, { slug: string; plural: string; short: string; badge: string }> = {
  1: { slug: "ednostaini-apartamenti", plural: "Едностайни апартаменти", short: "Едностайни", badge: "1" },
  2: { slug: "dvustaini-apartamenti", plural: "Двустайни апартаменти", short: "Двустайни", badge: "2" },
  3: { slug: "tristaini-apartamenti", plural: "Тристайни апартаменти", short: "Тристайни", badge: "3" },
  4: { slug: "mnogostaini-apartamenti", plural: "Многостайни апартаменти", short: "Многостайни", badge: "4+" },
};

/**
 * A neighborhood rooms page needs at least this many listings and must differ from its parent
 * /{квартал}/apartamenti/ page – otherwise it is thin or a duplicate of that page.
 */
export const MIN_NEIGHBORHOOD_ROOM_LISTINGS = 2;

export function roomLandingBySlug(slug: string | undefined): RoomCount | undefined {
  return ROOM_COUNTS.find((r) => ROOM_LANDINGS[r].slug === slug);
}

/** Bucket a listing's room count the same way the search RPC does (4 = 4+) */
export function roomBucket(rooms: number | null | undefined): RoomCount | null {
  if (rooms == null || !Number.isFinite(rooms) || rooms < 1) return null;
  return rooms >= 4 ? 4 : (Math.floor(rooms) as RoomCount);
}

export function isApartmentCategory(category: LandingCategory | null | undefined): boolean {
  return category?.slug === APARTMENT_LANDING_SLUG;
}

export function findApartmentCategory(categories: LandingCategory[]): LandingCategory | undefined {
  return categories.find(isApartmentCategory);
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

export function operationRoomsPath(operation: OperationType, room: RoomCount): string {
  return `/${OPERATION_LANDINGS[operation].slug}/${ROOM_LANDINGS[room].slug}/`;
}

export function neighborhoodRoomsPath(neighborhood: LandingNeighborhood, room: RoomCount): string {
  return `/${neighborhood.slug}/${ROOM_LANDINGS[room].slug}/`;
}

/**
 * The landing URL whose listing set equals these filters, or null when the combination has no landing page
 * (price/area ranges, features, search, non-default sort, or operation + neighborhood).
 * A single room count maps to a rooms page, but only together with the apartment category.
 */
export function landingPathFor(
  filters: PropertySearchFilters,
  categories: LandingCategory[],
  neighborhoods: LandingNeighborhood[]
): string | null {
  const { operationType, categoryId, neighborhoodId, sort, rooms, ...rest } = filters;
  const hasOther = Object.values(rest).some((v) => (Array.isArray(v) ? v.length > 0 : v != null));
  if (hasOther || (sort && sort !== "newest")) return null;

  const category = categoryId != null ? categories.find((c) => c.id === categoryId) : undefined;
  const neighborhood = neighborhoodId != null ? neighborhoods.find((n) => n.id === neighborhoodId) : undefined;
  if ((categoryId != null && !category) || (neighborhoodId != null && !neighborhood)) return null;

  let room: RoomCount | null = null;
  if (rooms && rooms.length > 0) {
    room = rooms.length === 1 && isApartmentCategory(category) ? roomBucket(rooms[0]) : null;
    if (!room) return null;
  }

  if (neighborhood && !operationType) {
    if (room) return neighborhoodRoomsPath(neighborhood, room);
    return category ? neighborhoodCategoryPath(neighborhood, category) : neighborhoodPath(neighborhood);
  }
  if (operationType && !neighborhood) {
    if (room) return operationRoomsPath(operationType, room);
    return category ? operationCategoryPath(operationType, category) : operationPath(operationType);
  }
  return null;
}

/** Listings matching a landing scope */
export function filterListings(
  listings: ListingIndexEntry[],
  scope: { operationType?: OperationType; categoryId?: number; neighborhoodId?: number; rooms?: RoomCount }
): ListingIndexEntry[] {
  return listings.filter(
    (l) =>
      (scope.operationType == null || l.operationType === scope.operationType) &&
      (scope.categoryId == null || l.categoryId === scope.categoryId) &&
      (scope.neighborhoodId == null || l.neighborhoodId === scope.neighborhoodId) &&
      (scope.rooms == null || roomBucket(l.rooms) === scope.rooms)
  );
}

/** Scope of a rooms landing page: an operation (/imoti-za-prodazhba/…) or a neighborhood (/{квартал}/…) */
export type RoomLandingScope = { operationType: OperationType; neighborhoodId?: never } | { neighborhoodId: number; operationType?: never };

export interface RoomLanding {
  room: RoomCount;
  /** Listings shown on the rooms page */
  listings: ListingIndexEntry[];
  minPrice: number | null;
}

/**
 * Rooms pages that exist for a scope – the single source of the thin/duplicate-content rules
 * shared by the routes, sitemap, navigation and internal links.
 */
export function roomLandingsFor(listings: ListingIndexEntry[], scope: RoomLandingScope, apartmentCategoryId: number): RoomLanding[] {
  const apartments = filterListings(listings, { ...scope, categoryId: apartmentCategoryId });
  return ROOM_COUNTS.map((room) => {
    const scoped = filterListings(apartments, { rooms: room });
    const prices = scoped.map((l) => l.priceEur).filter((p): p is number => typeof p === "number" && p > 0);
    return { room, listings: scoped, minPrice: prices.length ? Math.min(...prices) : null };
  }).filter(({ listings: scoped }) =>
    scope.neighborhoodId != null
      ? scoped.length >= MIN_NEIGHBORHOOD_ROOM_LISTINGS && scoped.length < apartments.length
      : scoped.length > 0
  );
}

/**
 * Like `landingPathFor`, but only when that landing page currently exists (has listings and passes the
 * rooms-page rules) – used by /properties/ to point its canonical at the keyword page.
 */
export function liveLandingPathFor(
  filters: PropertySearchFilters,
  data: { categories: LandingCategory[]; neighborhoods: LandingNeighborhood[]; listings: ListingIndexEntry[] }
): string | null {
  const path = landingPathFor(filters, data.categories, data.neighborhoods);
  if (!path) return null;

  const room = filters.rooms?.length === 1 ? roomBucket(filters.rooms[0]) : null;
  if (room && filters.categoryId != null) {
    const scope: RoomLandingScope =
      filters.neighborhoodId != null ? { neighborhoodId: filters.neighborhoodId } : { operationType: filters.operationType! };
    return roomLandingsFor(data.listings, scope, filters.categoryId).some((r) => r.room === room) ? path : null;
  }

  const scoped = filterListings(data.listings, {
    operationType: filters.operationType,
    categoryId: filters.categoryId,
    neighborhoodId: filters.neighborhoodId,
  });
  return scoped.length > 0 ? path : null;
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

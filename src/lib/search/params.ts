import type { PropertySearchFilters, SortOption } from "@/types/search";

/**
 * Shared (server + client) helpers for the /properties URL contract.
 * URL params: operation, category, neighborhood, minPrice, maxPrice, minArea, maxArea,
 * rooms + features (comma-separated or repeated), minBedrooms, new, featured, search, sort, page.
 */

export const PROPERTIES_PATH = "/properties/";
export const PROPERTIES_PAGE_SIZE = 12;

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Най-нови" },
  { value: "price_asc", label: "Цена: възходяща" },
  { value: "price_desc", label: "Цена: низходяща" },
  { value: "area_desc", label: "Площ: най-голяма" },
  { value: "area_asc", label: "Площ: най-малка" },
  { value: "oldest", label: "Най-стари" },
];

const SORT_VALUES = new Set<SortOption>(SORT_OPTIONS.map((o) => o.value));

/** Room-count filter values; 4 means "4 or more" */
export const ROOM_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: "Едностаен" },
  { value: 2, label: "Двустаен" },
  { value: 3, label: "Тристаен" },
  { value: 4, label: "Многостаен" },
];

const ROOM_VALUES = new Set(ROOM_OPTIONS.map((o) => o.value));

/** Minimal read interface satisfied by URLSearchParams and our record adapter */
interface ParamReader {
  get(key: string): string | null;
  getAll(key: string): string[];
}

type RawSearchParams = Record<string, string | string[] | undefined>;

/** Adapt Next.js `searchParams` objects to the URLSearchParams-like reader */
export function toParamReader(input: URLSearchParams | RawSearchParams): ParamReader {
  if (input instanceof URLSearchParams) return input;
  return {
    get(key) {
      const v = input[key];
      if (Array.isArray(v)) return v[0] ?? null;
      return v ?? null;
    },
    getAll(key) {
      const v = input[key];
      if (Array.isArray(v)) return v;
      return v == null ? [] : [v];
    },
  };
}

const parseNumber = (value: string | null): number | undefined => {
  if (value == null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const parseBoolean = (value: string | null): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

/** Supports both `features=1,2` and repeated `features=1&features=2` (native GET forms) */
const parseNumberList = (values: string[]): number[] | undefined => {
  const numbers = values
    .flatMap((v) => v.split(","))
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v) && v > 0);
  return numbers.length > 0 ? Array.from(new Set(numbers)) : undefined;
};

const parseRooms = (values: string[]): number[] | undefined => {
  const rooms = parseNumberList(values)?.filter((r) => ROOM_VALUES.has(r)).sort((a, b) => a - b);
  return rooms && rooms.length > 0 ? rooms : undefined;
};

/** Parse URL params into typed filters. Unknown keys are ignored on purpose. */
export function urlParamsToFilters(input: URLSearchParams | RawSearchParams): PropertySearchFilters {
  const params = toParamReader(input);
  const operation = params.get("operation");
  const sort = params.get("sort") as SortOption | null;
  const search = params.get("search")?.trim();

  return {
    operationType: operation === "sale" || operation === "rent" ? operation : undefined,
    categoryId: parseNumber(params.get("category")),
    neighborhoodId: parseNumber(params.get("neighborhood")),
    minPriceEur: parseNumber(params.get("minPrice")),
    maxPriceEur: parseNumber(params.get("maxPrice")),
    minArea: parseNumber(params.get("minArea")),
    maxArea: parseNumber(params.get("maxArea")),
    rooms: parseRooms(params.getAll("rooms")),
    minBedrooms: parseNumber(params.get("minBedrooms")),
    isFeatured: parseBoolean(params.get("featured")),
    isNew: parseBoolean(params.get("new")),
    featureIds: parseNumberList(params.getAll("features")),
    searchTerm: search ? search.slice(0, 100) : undefined,
    sort: sort && SORT_VALUES.has(sort) ? sort : undefined,
  };
}

export function parsePage(input: URLSearchParams | RawSearchParams): number {
  const p = Number(toParamReader(input).get("page") ?? 1);
  return Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1;
}

const URL_KEYS: Partial<Record<keyof PropertySearchFilters, string>> = {
  searchTerm: "search",
  operationType: "operation",
  categoryId: "category",
  neighborhoodId: "neighborhood",
  minPriceEur: "minPrice",
  maxPriceEur: "maxPrice",
  minArea: "minArea",
  maxArea: "maxArea",
  rooms: "rooms",
  minBedrooms: "minBedrooms",
  isFeatured: "featured",
  isNew: "new",
  featureIds: "features",
  sort: "sort",
};

/** Serialize filters (+ optional page) to URLSearchParams, skipping empty/default values */
export function filtersToURLParams(filters: PropertySearchFilters, page = 1): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(URL_KEYS) as Array<keyof PropertySearchFilters>).forEach((key) => {
    const value = filters[key];
    const urlKey = URL_KEYS[key]!;
    if (value == null) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(urlKey, value.join(","));
      return;
    }
    if (key === "sort" && value === "newest") return; // default sort keeps URLs canonical
    params.set(urlKey, String(value));
  });
  if (page > 1) params.set("page", String(page));
  return params;
}

/** Build a /properties/ href for the given filters and page */
export function buildPropertiesHref(filters: PropertySearchFilters, page = 1): string {
  const qs = filtersToURLParams(filters, page).toString();
  return qs ? `${PROPERTIES_PATH}?${qs}` : PROPERTIES_PATH;
}

/** Number of user-facing filters applied (excludes sort and paging) */
export function countActiveFilters(filters: PropertySearchFilters): number {
  return (Object.keys(URL_KEYS) as Array<keyof PropertySearchFilters>).filter((key) => {
    if (key === "sort") return false;
    const v = filters[key];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
  }).length;
}

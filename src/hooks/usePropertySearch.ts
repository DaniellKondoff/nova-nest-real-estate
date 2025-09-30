'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropertyWithDetails } from "@/types/property";
import type { PropertySearchFilters } from "@/types/search";

/**
 * Return type for the usePropertySearch hook
 */
export interface UsePropertySearchReturn {
  // Current state
  properties: PropertyWithDetails[];
  filters: PropertySearchFilters;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasMore: boolean;

  // Actions
  setFilters: (next: PropertySearchFilters) => void;
  updateFilter: <K extends keyof PropertySearchFilters>(key: K, value: PropertySearchFilters[K]) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

/** Default pagination size */
const DEFAULT_LIMIT = 20;
/** Debounce delay for search/filter changes (ms) */
const SEARCH_DEBOUNCE_MS = 500;
/** Debounce delay for URL updates (ms) */
const URL_DEBOUNCE_MS = 300;
/** Default error message (BG) */
const DEFAULT_ERROR_BG = "Възникна грешка при търсенето";

/**
 * Helper: Convert filters + page to URLSearchParams, skipping empty values
 */
export function filtersToURLParams(filters: PropertySearchFilters, page: number, limit: number = DEFAULT_LIMIT): URLSearchParams {
  const params = new URLSearchParams();

  // Add page & limit
  params.set("page", String(Math.max(1, Math.floor(page))))
  params.set("limit", String(Math.max(1, Math.floor(limit))))

  // Iterate filter keys and serialize
  Object.entries(filters).forEach(([key, rawValue]) => {
    // Skip undefined/null/empty values
    if (rawValue == null) return;
    if (typeof rawValue === "string" && rawValue.trim() === "") return;
    if (Array.isArray(rawValue) && rawValue.length === 0) return;

    // Map internal filter keys to URL param names
    const mapKey = (k: keyof PropertySearchFilters): string => {
      switch (k) {
        case "searchTerm": return "search";
        case "operationType": return "operation";
        case "categoryId": return "category";
        case "neighborhoodId": return "neighborhood";
        case "minPriceEur": return "minPrice";
        case "maxPriceEur": return "maxPrice";
        case "minArea": return "minArea";
        case "maxArea": return "maxArea";
        case "minBedrooms": return "minBedrooms";
        case "minBathrooms": return "minBathrooms";
        case "isFeatured": return "featured";
        case "isNew": return "new";
        case "hasElevator": return "elevator";
        case "hasTerrace": return "terrace";
        case "hasBalcony": return "balcony";
        case "featureIds": return "features";
        case "status": return "status";
        case "sort": return "sort";
        default: return String(k);
      }
    };

    const urlKey = mapKey(key as keyof PropertySearchFilters);

    // Arrays as comma-separated strings
    if (Array.isArray(rawValue)) {
      params.set(urlKey, rawValue.join(","));
      return;
    }

    // Booleans/numbers/strings as-is
    params.set(urlKey, String(rawValue));
  });

  return params;
}

/**
 * Helper: Parse URLSearchParams into typed PropertySearchFilters
 * - Handles numbers, booleans, arrays (comma-separated)
 */
export function urlParamsToFilters(searchParams: URLSearchParams): PropertySearchFilters {
  const parseNumber = (value: string | null): number | undefined => {
    if (value == null) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  };

  const parseBoolean = (value: string | null): boolean | undefined => {
    if (value == null) return undefined;
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  };

  const parseNumberArray = (value: string | null): number[] | undefined => {
    if (!value) return undefined;
    const numbers = value
      .split(",")
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));
    return numbers.length > 0 ? numbers : undefined;
  };

  const parseStringArray = (value: string | null): string[] | undefined => {
    if (!value) return undefined;
    const arr = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    return arr.length > 0 ? arr : undefined;
  };

  // Build filters from known URL keys; unknown keys are ignored on purpose
  const filters: PropertySearchFilters = {
    operationType: (searchParams.get("operation") as PropertySearchFilters["operationType"]) ?? undefined,
    status: parseStringArray(searchParams.get("status")) as PropertySearchFilters["status"],
    categoryId: parseNumber(searchParams.get("category")),
    neighborhoodId: parseNumber(searchParams.get("neighborhood")),
    minPriceEur: parseNumber(searchParams.get("minPrice")),
    maxPriceEur: parseNumber(searchParams.get("maxPrice")),
    minArea: parseNumber(searchParams.get("minArea")),
    maxArea: parseNumber(searchParams.get("maxArea")),
    minBedrooms: parseNumber(searchParams.get("minBedrooms")),
    minBathrooms: parseNumber(searchParams.get("minBathrooms")),
    isFeatured: parseBoolean(searchParams.get("featured")),
    isNew: parseBoolean(searchParams.get("new")),
    hasElevator: parseBoolean(searchParams.get("elevator")),
    hasTerrace: parseBoolean(searchParams.get("terrace")),
    hasBalcony: parseBoolean(searchParams.get("balcony")),
    featureIds: parseNumberArray(searchParams.get("features")),
    searchTerm: searchParams.get("search") ?? undefined,
    sort: (searchParams.get("sort") as PropertySearchFilters["sort"]) ?? undefined,
  };

  return filters;
}

/** Smoothly scroll viewport to the top */
export function scrollToTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Normalize errors to Bulgarian user-facing messages.
 */
export function formatSearchError(err: unknown): string {
  // Timeout signal
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Заявката отне твърде дълго време";
  }

  if (typeof err === "object" && err !== null) {
    // Fetch network errors may show up as TypeError in some environments
    if (err instanceof TypeError) {
      return "Няма връзка със сървъра";
    }

    const message = (err as { message?: string }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      // Heuristic: Common network keywords
      const m = message.toLowerCase();
      if (m.includes("network") || m.includes("fetch") || m.includes("failed")) {
        return "Няма връзка със сървъра";
      }
      return message;
    }
  }

  return DEFAULT_ERROR_BG;
}

/**
 * usePropertySearch
 * Client-side hook to manage property search state, URL synchronization, and debounced fetching.
 */
export function usePropertySearch(initialLimit: number = DEFAULT_LIMIT): UsePropertySearchReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Note: Keep primitives in state for UI responsiveness
  const [filters, setFiltersState] = useState<PropertySearchFilters>(() => urlParamsToFilters(new URLSearchParams(searchParams?.toString() ?? "")));
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = Number(searchParams?.get("page") ?? 1);
    return Number.isFinite(p) && p > 0 ? Math.floor(p) : 1;
  });
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Refs for lifecycle and concurrency control
  const mountedRef = useRef<boolean>(false);
  const inFlightControllerRef = useRef<AbortController | null>(null);
  const fetchSeqRef = useRef<number>(0); // monotonic id to ignore stale responses
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limit = useMemo(() => Math.max(1, Math.floor(initialLimit)), [initialLimit]);

  // Derived value for UI pagination controls
  const hasMore = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);

  /** Update URL when filters/page change (debounced) */
  const scheduleUrlUpdate = useCallback(
    (nextFilters: PropertySearchFilters, nextPage: number) => {
      if (!pathname) return;
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);

      urlDebounceRef.current = setTimeout(() => {
        const params = filtersToURLParams(nextFilters, nextPage, limit);
        const url = `${pathname}?${params.toString()}`;
        // App Router performs client-side transitions; shallow reload is default for client components
        router.push(url, { scroll: false });
      }, URL_DEBOUNCE_MS);
    },
    [limit, pathname, router]
  );

  /** Replace all filters; resets page to 1 and triggers search */
  const setFilters = useCallback((next: PropertySearchFilters) => {
    let mergedNext: PropertySearchFilters = {};
    setFiltersState((prev) => {
      mergedNext = { ...prev, ...next } as PropertySearchFilters;
      return mergedNext;
    });
    setCurrentPage(1);
    setLoading(true);
    scheduleUrlUpdate(mergedNext, 1);

    // Debounced fetch via effect below
  }, [scheduleUrlUpdate]);

  /** Update a single filter key; resets page to 1 and triggers search */
  const updateFilter = useCallback(<K extends keyof PropertySearchFilters>(key: K, value: PropertySearchFilters[K]) => {
    let mergedNext: PropertySearchFilters = {};
    setFiltersState((prev) => {
      mergedNext = { ...prev, [key]: value } as PropertySearchFilters;
      return mergedNext;
    });
    setCurrentPage(1);
    setLoading(true);
    scheduleUrlUpdate(mergedNext, 1);
    // Debounced fetch via effect below
  }, [scheduleUrlUpdate]);

  /** Clear all filters to initial empty state */
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setCurrentPage(1);
    setLoading(true);
    scheduleUrlUpdate({}, 1);
    // Debounced fetch via effect below
  }, [scheduleUrlUpdate]);

  /** Change page immediately and fetch */
  const setPage = useCallback((page: number) => {
    const next = Math.max(1, Math.floor(page));
    setCurrentPage(next);
    setLoading(true);
    scheduleUrlUpdate(filters, next);
    // Immediate fetch via dedicated effect
    scrollToTop();
  }, [filters, scheduleUrlUpdate]);

  /** Abort any pending request */
  const abortInFlight = useCallback(() => {
    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
      inFlightControllerRef.current = null;
    }
  }, []);

  /**
   * Internal fetcher: POST /api/properties/search with filters + pagination
   * - Uses AbortController for cancellation
   * - Guards against race conditions by comparing sequence ids
   */
  const fetchProperties = useCallback(async (activeFilters: PropertySearchFilters, page: number): Promise<void> => {
    const seq = ++fetchSeqRef.current;
    abortInFlight();
    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    try {
      const body = {
        filters: activeFilters,
        page: Math.max(1, Math.floor(page)),
        limit,
      } as const;

      const res = await fetch("/api/properties/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      // Non-2xx handled below too; we still try to parse JSON error
      const json = await res.json().catch(() => null);

      // Ignore stale responses
      if (seq !== fetchSeqRef.current || controller.signal.aborted) return;

      if (!res.ok) {
        const apiError = (json && typeof json === "object" && (json as any).error) ? String((json as any).error) : undefined;
        throw new Error(apiError || DEFAULT_ERROR_BG);
      }

      // Accept multiple shapes:
      // 1) { success: true, data: { properties, total, page, totalPages, hasMore } }
      // 2) { data: { properties|items, total|meta.total, page|meta.page, totalPages|computed, hasMore? } }
      const payload: unknown = json;
      let data: any = payload;

      if (data && typeof data === "object" && ("success" in data || "data" in data)) {
        data = (data as any).data ?? data;
      }

      const items: PropertyWithDetails[] = (data?.properties ?? data?.items) ?? [];
      const total: number = (typeof data?.total === "number" ? data.total : (typeof data?.count === "number" ? data.count : (data?.meta?.total ?? 0))) as number;
      const pageFromApi: number = (typeof data?.page === "number" ? data.page : (typeof data?.meta?.page === "number" ? data.meta.page : page)) as number;
      const totalPagesFromApi: number | undefined = typeof data?.totalPages === "number" ? data.totalPages : undefined;
      const hasMoreFromApi: boolean | undefined = typeof data?.hasMore === "boolean" ? data.hasMore : undefined;

      const computedTotalPages = totalPagesFromApi ?? Math.max(1, Math.ceil(total / limit));
      const computedHasMore = typeof hasMoreFromApi === "boolean" ? hasMoreFromApi : pageFromApi < computedTotalPages;

      setProperties(Array.isArray(items) ? items : []);
      setTotalResults(Number.isFinite(total) ? total : 0);
      setTotalPages(computedTotalPages);
      setCurrentPage(Math.max(1, Math.floor(pageFromApi)));
      setError(null);
    } catch (err) {
      // Ignore if aborted/stale
      if (controller.signal.aborted || seq !== fetchSeqRef.current) return;
      // eslint-disable-next-line no-console
      console.error("[usePropertySearch] fetch error:", err);
      setError(formatSearchError(err));
    } finally {
      if (seq === fetchSeqRef.current) {
        setLoading(false);
      }
    }
  }, [abortInFlight, limit]);

  /** Force refetch with current state */
  const refetch = useCallback(() => {
    setLoading(true);
    fetchProperties(filters, currentPage).catch(() => {
      // errors handled inside fetchProperties
    });
  }, [currentPage, fetchProperties, filters]);

  // On mount: mark mounted, initialize from URL (already done in state initializers)
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup timers and in-flight requests
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      abortInFlight();
    };
  }, [abortInFlight]);

  // Debounced fetching when filters change (resets page to currentPage state, typically 1 after updates)
  useEffect(() => {
    if (!mountedRef.current) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      fetchProperties(filters, currentPage).catch(() => undefined);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [filters, currentPage, fetchProperties]);

  // Immediate fetch when page changes specifically (without waiting the 500ms debounce)
  // This effect runs alongside the general filters effect; we guard to only run on page transitions
  const lastPageRef = useRef<number>(currentPage);
  useEffect(() => {
    if (!mountedRef.current) {
      lastPageRef.current = currentPage;
      return;
    }
    if (currentPage !== lastPageRef.current) {
      // Cancel any scheduled debounced search
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      fetchProperties(filters, currentPage).catch(() => undefined);
      lastPageRef.current = currentPage;
    }
  }, [currentPage, fetchProperties, filters]);

  return {
    properties,
    filters,
    loading,
    error,
    currentPage,
    totalPages,
    totalResults,
    hasMore,
    setFilters,
    updateFilter,
    clearFilters,
    setPage,
    refetch,
  };
}



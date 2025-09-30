import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { PropertyWithDetails } from "@/types/property";
import type { PropertySearchFilters } from "@/types/search";
import { PropertySearchSchema } from "@/lib/validations";
import { searchProperties, getPublishedProperties } from "@/lib/queries/properties";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import { getServerClient } from "@/lib/supabase/server";

// Request body schema leveraging existing PropertySearchSchema, with page/limit
const BodySchema = z.object({
  filters: PropertySearchSchema.partial()
    .extend({
      // Accept EUR-specific aliases coming from the UI hook
      minPriceEur: z.number().int().min(0).optional(),
      maxPriceEur: z.number().int().min(0).optional(),
      sort: z
        .enum(["newest", "oldest", "price_asc", "price_desc", "area_asc", "area_desc"]) 
        .optional(),
      // Allow additional optional filters without failing validation
    })
    .passthrough()
    .default({}),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

type ParsedBody = z.infer<typeof BodySchema> & { filters: PropertySearchFilters };

function toQueryFilters(filters: PropertySearchFilters): {
  searchTerm?: string;
  categoryId?: number;
  neighborhoodId?: number;
  operationType?: any; // Supabase enum type already enforced by schema
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
} {
  return {
    searchTerm: filters.searchTerm,
    categoryId: filters.categoryId,
    neighborhoodId: filters.neighborhoodId,
    operationType: filters.operationType as unknown,
    minPrice: (filters as unknown as { minPrice?: number; minPriceEur?: number }).minPriceEur ??
      (filters as unknown as { minPrice?: number }).minPrice,
    maxPrice: (filters as unknown as { maxPrice?: number; maxPriceEur?: number }).maxPriceEur ??
      (filters as unknown as { maxPrice?: number }).maxPrice,
    minArea: filters.minArea,
    maxArea: filters.maxArea,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if request has body
    const contentLength = req.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { success: false, error: "Празна заявка" },
        { status: 400 }
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch (parseError) {
      console.error('[properties/search] JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, error: "Невалиден JSON в заявката" },
        { status: 400 }
      );
    }
    
    // Validate that we have a valid object
    if (!json || typeof json !== 'object') {
      return NextResponse.json(
        { success: false, error: "Невалидна структура на данните" },
        { status: 400 }
      );
    }
    
    const parsed = (await BodySchema.parseAsync(json)) as ParsedBody;

    const page = Math.max(1, parsed.page);
    const limit = Math.max(1, Math.min(100, parsed.limit));
    const { searchTerm, ...restFilters } = toQueryFilters(parsed.filters);

    // First stage: get matching IDs via RPC search (fast, indexed) when filters provided; otherwise, use fallback list
    let ids: number[] = [];
    const hasAnyFilter = Boolean(
      searchTerm ||
      typeof restFilters.categoryId === "number" ||
      typeof restFilters.neighborhoodId === "number" ||
      typeof restFilters.minPrice === "number" ||
      typeof restFilters.maxPrice === "number" ||
      typeof restFilters.minArea === "number" ||
      typeof restFilters.maxArea === "number" ||
      restFilters.operationType
    );

    if (hasAnyFilter) {
      try {
        const searchList = await searchProperties(searchTerm, restFilters);
        ids = searchList.map((r) => r.id);
      } catch (_e) {
        const all = await getPublishedProperties();
        const filtered = all.filter((p) => {
          const byCategory = typeof restFilters.categoryId === "number" ? p.category_id === restFilters.categoryId : true;
          const byNeighborhood = typeof restFilters.neighborhoodId === "number" ? p.neighborhood_id === restFilters.neighborhoodId : true;
          const price = (p.price_eur ?? undefined) ?? (p.price_bgn ?? undefined);
          const byMinPrice = typeof restFilters.minPrice === "number" ? (price ?? 0) >= restFilters.minPrice : true;
          const byMaxPrice = typeof restFilters.maxPrice === "number" ? (price ?? 0) <= restFilters.maxPrice : true;
          const byAreaMin = typeof restFilters.minArea === "number" ? (p.area_sqm ?? 0) >= restFilters.minArea : true;
          const byAreaMax = typeof restFilters.maxArea === "number" ? (p.area_sqm ?? 0) <= restFilters.maxArea : true;
          const bySearch = searchTerm && p.title_bg ? p.title_bg.toLowerCase().includes(searchTerm.toLowerCase()) : true;
          return byCategory && byNeighborhood && byMinPrice && byMaxPrice && byAreaMin && byAreaMax && bySearch;
        });
        ids = filtered.map((p) => Number(p.id)).filter((n) => Number.isFinite(n));
      }
    } else {
      const all = await getPublishedProperties();
      ids = all.map((p) => Number(p.id)).filter((n) => Number.isFinite(n));
    }

    const total = ids.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const clampedPage = totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1;
    const offset = (clampedPage - 1) * limit;
    const pageIds = ids.slice(offset, offset + limit);

    // Fetch details for current page in a single joined query
    const supabase = await getServerClient();
    let properties: PropertyWithDetails[] = [];
    if (pageIds.length > 0) {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "*, neighborhood:neighborhood_id(id,name_bg,slug), category:property_categories(*), images:property_images(id,url,is_primary,sort_order,alt_text_bg)"
        )
        .in("id", pageIds)
        .eq("status", "available")
        .order(
          parsed.filters.sort === "oldest" ? "created_at" :
          parsed.filters.sort === "price_asc" || parsed.filters.sort === "price_desc" ? "price_eur" :
          parsed.filters.sort === "area_asc" || parsed.filters.sort === "area_desc" ? "area_sqm" : "created_at",
          { ascending: parsed.filters.sort === "oldest" || parsed.filters.sort === "price_asc" || parsed.filters.sort === "area_asc" }
        );

      if (error) {
        throw new DatabaseError("Грешка при извличане на данни");
      }

      // Map flat rows with joined relations into PropertyWithDetails shape
      const rows = (data ?? []) as unknown[];
      properties = rows.map((row) => {
        const r = row as Record<string, unknown> & {
          neighborhood?: Record<string, unknown> | null;
          category?: Record<string, unknown> | null;
          images?: Record<string, unknown>[] | null;
        };
        return {
          property: row as unknown as PropertyWithDetails["property"],
          neighborhood: (r.neighborhood as PropertyWithDetails["neighborhood"]) ?? null,
          category: (r.category as PropertyWithDetails["category"]) ?? null,
          images: ((r.images as PropertyWithDetails["images"]) ?? []) as PropertyWithDetails["images"],
        } satisfies PropertyWithDetails;
      });
    }

    const hasMore = totalPages > 0 ? clampedPage < totalPages : false;

    const responseBody = {
      success: true,
      data: {
        properties,
        total,
        page: clampedPage,
        totalPages,
        hasMore,
      },
    } as const;

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[properties/search] handler error:", err);

    if (err instanceof z.ZodError || err instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: "Невалидни параметри за търсене" },
        { status: 400 }
      );
    }

    const message = formatErrorMessage(err) || "Възникна грешка при обработка на заявката";
    const isDb = err instanceof DatabaseError;
    return NextResponse.json(
      { success: false, error: isDb ? "Грешка при извличане на данни" : message },
      { status: 500 }
    );
  }
}



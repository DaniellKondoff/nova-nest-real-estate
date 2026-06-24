import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { PropertyWithDetails } from "@/types/property";
import type { PropertySearchFilters } from "@/types/search";
import { PropertySearchSchema } from "@/lib/validations";
import { searchProperties, searchPropertiesFallback } from "@/lib/queries/properties";
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
  featureIds?: number[];
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
    featureIds: filters.featureIds,
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
      restFilters.operationType ||
      (restFilters.featureIds && restFilters.featureIds.length > 0)
    );

    let total = 0;
    let pageIds: number[] = [];

    if (hasAnyFilter) {
      try {
        const searchList = await searchProperties(searchTerm, restFilters);
        ids = searchList.map((r) => r.id);
        total = ids.length;
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
        const clampedPage2 = totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1;
        const offset2 = (clampedPage2 - 1) * limit;
        pageIds = ids.slice(offset2, offset2 + limit);
      } catch (_e) {
        // RPC failed — use server-side fallback that filters in Postgres, not in JS
        const fallbackList = await searchPropertiesFallback(searchTerm, restFilters);
        ids = fallbackList.map((r) => r.id);
        total = ids.length;
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
        const clampedPage2 = totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1;
        const offset2 = (clampedPage2 - 1) * limit;
        pageIds = ids.slice(offset2, offset2 + limit);
      }
    } else {
      // No filters — paginate directly in the DB; fetch only IDs + total count
      const supabaseForCount = await getServerClient();
      const { data: pageRows, count: totalCount } = await supabaseForCount
        .from("properties")
        .select("id", { count: "exact" })
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      total = totalCount ?? 0;
      pageIds = (pageRows ?? []).map((p) => Number(p.id)).filter((n) => Number.isFinite(n));
    }

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const clampedPage = totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1;

    // Fetch details for current page in a single joined query
    const supabase = await getServerClient();
    let properties: PropertyWithDetails[] = [];
    if (pageIds.length > 0) {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "*, neighborhood:neighborhood_id(id,name_bg,slug), category:property_categories(*), images:property_images(id,url,is_primary,sort_order,alt_text_bg), features:property_property_features(feature_id,property_features(*))"
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
          features?: Array<{ property_features: Record<string, unknown> }> | null;
        };
        
        // Transform features data to match expected format
        const transformedFeatures = r.features?.map((pf) => pf.property_features).filter(Boolean) || [];
        
        return {
          property: row as unknown as PropertyWithDetails["property"],
          neighborhood: (r.neighborhood as PropertyWithDetails["neighborhood"]) ?? null,
          category: (r.category as PropertyWithDetails["category"]) ?? null,
          images: ((r.images as PropertyWithDetails["images"]) ?? []) as PropertyWithDetails["images"],
          features: transformedFeatures as PropertyWithDetails["features"],
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



import { NextRequest } from "next/server";
import { z } from "zod";
import { searchProperties, searchPropertiesFallback, type SearchFilters as QuerySearchFilters } from "@/lib/queries/properties";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import type { Database } from "@/types/database.generated";
import { ok, fail } from "@/lib/api";

const QuerySchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    category: z.coerce.number().int().positive().optional(),
    neighborhood: z.coerce.number().int().positive().optional(),
    operationType: z.enum(["sale", "rent"]).optional() as unknown as z.ZodType<
      Database["public"]["Enums"]["property_operation_type"]
    >,
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    minArea: z.coerce.number().int().min(0).optional(),
    maxArea: z.coerce.number().int().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine((v) => (v.minPrice != null && v.maxPrice != null ? v.minPrice <= v.maxPrice : true), {
    message: "Минималната цена не може да е по-голяма от максималната.",
    path: ["minPrice"],
  })
  .refine((v) => (v.minArea != null && v.maxArea != null ? v.minArea <= v.maxArea : true), {
    message: "Минималната площ не може да е по-голяма от максималната.",
    path: ["minArea"],
  });

function isLikelyEnglish(term: string | undefined): boolean {
  if (!term) return false;
  return /[A-Za-z]/.test(term) && !/[А-Яа-яЁёЍѝ]/.test(term);
}

/**
 * Full-text and filtered property search with pagination
 *
 * Authentication: not required
 * Fallback: if likely English query returns no results, calls EN-specific RPC
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = await QuerySchema.parseAsync(raw);

    const filters: QuerySearchFilters = {
      categoryId: parsed.category,
      neighborhoodId: parsed.neighborhood,
      operationType: parsed.operationType,
      minPrice: parsed.minPrice,
      maxPrice: parsed.maxPrice,
      minArea: parsed.minArea,
      maxArea: parsed.maxArea,
    };

    const started = Date.now();
    let results = await searchProperties(parsed.q, filters);

    // If user searched in English and we got no results, try EN fallback directly
    if ((results?.length ?? 0) === 0 && isLikelyEnglish(parsed.q)) {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase.rpc("search_properties_v2", {
          p_search_term: parsed.q || undefined,
          p_language_code: "en",
          p_category_id: filters.categoryId,
          p_neighborhood_id: filters.neighborhoodId,
          p_operation_type: filters.operationType,
          p_min_price: filters.minPrice,
          p_max_price: filters.maxPrice,
          p_min_area: filters.minArea,
          p_max_area: filters.maxArea,
        });
        if (error) {
          console.warn("English RPC search failed, using fallback:", error);
          // Use the same fallback search method
          results = await searchPropertiesFallback(parsed.q, filters);
        } else {
          results = (data as any) ?? [];
        }
      } catch (error) {
        console.warn("English RPC search failed, using fallback:", error);
        // Use the same fallback search method
        results = await searchPropertiesFallback(parsed.q, filters);
      }
    }

    const tookMs = Date.now() - started;
    const total = results?.length ?? 0;
    const start = (parsed.page - 1) * parsed.limit;
    const end = start + parsed.limit;
    const paged = results.slice(start, end);

    const body: SuccessResponse<{
      results: typeof paged;
      total: number;
      page: number;
      limit: number;
      tookMs: number;
    }> = {
      data: {
        results: paged,
        total,
        page: parsed.page,
        limit: parsed.limit,
        tookMs,
      },
    };
    return ok(body.data);
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: message };
    if (err instanceof z.ZodError) {
      return fail("Невалидни параметри.", { status: 400, code: "VALIDATION_ERROR", details: { issues: err.issues } });
    }
    return fail(body.error, { status });
  }
}



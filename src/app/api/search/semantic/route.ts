import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api";
import { semanticSearch, type SemanticSearchFilters } from "@/lib/search/semantic";
import { extractFiltersFromQuery } from "@/lib/search/filters";

const FiltersSchema = z.object({
  operationType:  z.enum(["sale", "rent"]).optional(),
  categoryId:     z.number().int().positive().optional(),
  neighborhoodId: z.number().int().positive().optional(),
  minPriceEur:    z.number().min(0).optional(),
  maxPriceEur:    z.number().min(0).optional(),
  minAreaSqm:     z.number().min(0).optional(),
  maxAreaSqm:     z.number().min(0).optional(),
  minRooms:       z.number().int().min(1).optional(),
  maxRooms:       z.number().int().min(1).optional(),
});

const BodySchema = z.object({
  query:   z.string().trim().min(1, "Моля, въведете текст за търсене."),
  topK:    z.number().int().min(1).max(20).optional().default(10),
  filters: FiltersSchema.optional(),
});

export async function POST(req: NextRequest) {
  const started = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Невалидно JSON тяло.", { status: 400, code: "INVALID_JSON" });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail("Невалидни параметри.", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { issues: parsed.error.issues },
    });
  }

  const { query, topK, filters } = parsed.data;

  // Auto-extract filters from the query text, then merge with explicit filters
  // (explicit filters take precedence over auto-extracted ones).
  const extracted = extractFiltersFromQuery(query);
  const mergedFilters: SemanticSearchFilters = { ...extracted, ...filters };

  const { properties, neighborhoods } = await semanticSearch(query, mergedFilters, topK);

  return ok({ properties, neighborhoods, query, tookMs: Date.now() - started });
}

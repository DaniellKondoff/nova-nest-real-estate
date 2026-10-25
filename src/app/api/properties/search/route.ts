import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { PropertySearchFilters } from "@/types/search";
import { PropertySearchSchema } from "@/lib/validations";
import { searchPropertyListings } from "@/lib/queries/property-listings";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";

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
    const filters: PropertySearchFilters = {
      ...parsed.filters,
      // Accept legacy minPrice/maxPrice aliases alongside the EUR-specific keys
      minPriceEur: parsed.filters.minPriceEur ?? (parsed.filters as { minPrice?: number }).minPrice,
      maxPriceEur: parsed.filters.maxPriceEur ?? (parsed.filters as { maxPrice?: number }).maxPrice,
    };

    const data = await searchPropertyListings(filters, parsed.page, parsed.limit);
    const responseBody = { success: true, data } as const;

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



import { NextRequest } from "next/server";
import { z } from "zod";
import { getCachedNeighborhoods } from "@/lib/queries/neighborhoods";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail } from "@/lib/api";

const QuerySchema = z.object({
  // No query parameters needed for neighborhoods endpoint
});

/**
 * Get neighborhoods metadata for filters and maps
 *
 * Authentication: not required
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = await QuerySchema.parseAsync(raw);

    const neighborhoods = await getCachedNeighborhoods();

    const body: SuccessResponse<{ neighborhoods: any[] }> = {
      data: { neighborhoods },
    };
    return ok(body.data, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
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



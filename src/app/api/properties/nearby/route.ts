import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail } from "@/lib/api";

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.1).max(50).default(5), // km
});

/**
 * Geospatial property lookup by center point and radius (km)
 *
 * Authentication: not required
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = await QuerySchema.parseAsync(raw);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc("get_properties_within_radius", {
      center_lat: parsed.lat,
      center_lng: parsed.lng,
      radius_km: parsed.radius,
    });
    if (error) {
      throw new DatabaseError("Грешка при географско търсене.");
    }

    const body: SuccessResponse<{ properties: any[] }> = {
      data: { properties: (data as any[]) ?? [] },
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



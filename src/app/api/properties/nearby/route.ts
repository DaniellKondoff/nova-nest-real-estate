import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.1).max(50).default(5), // km
});

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
    return Response.json(body, { status: 200 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status });
  }
}



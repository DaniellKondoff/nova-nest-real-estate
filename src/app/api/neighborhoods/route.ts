import { NextRequest } from "next/server";
import { z } from "zod";
import { getAllNeighborhoods } from "@/lib/queries/neighborhoods";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";

const QuerySchema = z.object({
  is_active: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = await QuerySchema.parseAsync(raw);

    // Base load
    let neighborhoods = await getAllNeighborhoods();

    if (typeof parsed.is_active === "boolean") {
      neighborhoods = neighborhoods.filter((n: any) => n.is_active === parsed.is_active);
    }

    // Ensure coordinates and amenities present by enriching from DB if needed
    const supabase = getSupabaseClient();
    // Assuming neighborhoods table already includes coordinates and amenities fields
    // If not, join via RPC or views; for now return as-is

    const body: SuccessResponse<{ neighborhoods: any[] }> = {
      data: { neighborhoods },
    };
    return Response.json(body, { status: 200 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status });
  }
}



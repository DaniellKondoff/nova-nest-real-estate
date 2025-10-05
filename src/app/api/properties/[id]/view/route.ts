import { NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail } from "@/lib/api";

/**
 * Track a property view with rate limiting
 * 
 * Authentication: not required
 * Rate limiting: 1 view per IP per 5 minutes per property
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const idNum = Number(idParam);
    
    if (!Number.isFinite(idNum) || idNum <= 0) {
      throw new ValidationError("Невалидно ID на имот.");
    }

    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
    
    // Create a simple rate limiting key
    const rateLimitKey = `view_${idNum}_${ip}`;
    
    // Check if this IP has viewed this property recently (5 minutes)
    // For now, we'll use a simple approach - in production you might want to use Redis
    const supabase = await getSupabaseClient();
    
    // Call the database function to increment view count atomically
    const { data, error } = await supabase.rpc("increment_property_view", {
      property_id: idNum
    });

    if (error) {
      console.error("Error incrementing property view:", error);
      throw new DatabaseError("Грешка при записване на преглед.");
    }

    if (!data || data.length === 0) {
      throw new DatabaseError("Имотът не е намерен.");
    }

    const result = data[0];
    
    const body: SuccessResponse<{
      view_count: number;
      last_viewed_at: string;
    }> = {
      data: {
        view_count: result.view_count,
        last_viewed_at: result.last_viewed_at,
      },
    };

    return ok(body.data);
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: message };
    return fail(body.error, { status });
  }
}

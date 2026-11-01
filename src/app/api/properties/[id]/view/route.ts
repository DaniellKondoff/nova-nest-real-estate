import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse } from "@/types/api";
import { ok, fail } from "@/lib/api";
import { checkRateLimit, hashIp } from "@/lib/chat/rate-limit";
import { isBotUserAgent } from "@/lib/bot-detection";

const VIEW_WINDOW_SECONDS = 86_400;

type ViewRow = { view_count: number | null; last_viewed_at: string | null };

/**
 * Track a property view
 *
 * Authentication: not required
 * Counting: bots are ignored; 1 view per hashed IP per property per UTC day
 * (durable limiter from rate-limit.ts – no raw IPs stored). The client also dedupes per session.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const idNum = Number(idParam);

    if (!Number.isFinite(idNum) || idNum <= 0) {
      throw new ValidationError("Невалидно ID на имот.");
    }

    if (isBotUserAgent(req.headers.get("user-agent"))) {
      return ok({ counted: false });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = (forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "unknown";

    // Unknown IPs would all share one key – rely on the client-side session dedupe for them
    if (ip !== "unknown") {
      const { allowed } = await checkRateLimit(`view:${idNum}:${hashIp(ip)}`, 1, VIEW_WINDOW_SECONDS);
      if (!allowed) return ok({ counted: false });
    }

    // Service client: increment_property_view is SECURITY INVOKER, and RLS blocks the anon UPDATE
    // (the call "succeeded" with a null row and nothing was counted)
    // @ts-expect-error - RPC function not in generated types yet
    const { data, error } = await getServiceClient().rpc("increment_property_view", {
      property_id: idNum,
    });

    if (error) {
      console.error("Error incrementing property view:", error);
      throw new DatabaseError("Грешка при записване на преглед.");
    }

    const result = (data as ViewRow[] | null)?.[0];
    if (!result || result.view_count == null) {
      throw new DatabaseError("Имотът не е намерен.");
    }

    return ok({
      counted: true,
      view_count: result.view_count,
      last_viewed_at: result.last_viewed_at,
    });
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: message };
    return fail(body.error, { status });
  }
}

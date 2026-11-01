import { createHash } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/service";

/**
 * Durable fixed-window rate limiter backed by Postgres (scripts/migrations/016_create_api_rate_limits.sql),
 * shared by all serverless instances. Falls back to a per-instance memory limiter when the RPC
 * is unavailable (migration not applied, DB hiccup), so a request is never unlimited and the
 * limiter never takes the route down.
 */

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

/** Hashes an IP for use in a rate-limit key – raw IPs are never stored */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`novanest-rl:${ip}`).digest("hex").slice(0, 32);
}

export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  try {
    // @ts-expect-error - RPC function not in generated types yet
    const { data, error } = await getServiceClient().rpc("rate_limit_hit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;

    const row = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; retry_after: number } | undefined;
    if (!row) throw new Error("empty rate_limit_hit result");
    return row.allowed ? { allowed: true } : { allowed: false, retryAfter: row.retry_after };
  } catch (err) {
    console.warn("[rate-limit] durable limiter unavailable, using in-memory fallback:", err);
    return checkMemoryRateLimit(key, limit, windowSeconds * 1000);
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback: per instance only (on serverless each instance has its own copy)
// ---------------------------------------------------------------------------

const MAX_KEYS = 5_000;
const store = new Map<string, { timestamps: number[]; windowMs: number }>();

/** Drops keys with no requests in their window so the map can't grow without bound */
function prune(now: number): void {
  for (const [key, entry] of store) {
    if (!entry.timestamps.some((t) => now - t < entry.windowMs)) store.delete(key);
  }
}

function checkMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (store.size > MAX_KEYS) prune(now);
  const entry = store.get(key) ?? { timestamps: [], windowMs };

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.timestamps[0] + windowMs - now) / 1000) };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return { allowed: true };
}

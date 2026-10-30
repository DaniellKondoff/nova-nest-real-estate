const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per IP per window

interface Entry {
  timestamps: number[];
}

const MAX_KEYS = 5_000;

// Per-instance memory only: on serverless each instance has its own copy (a durable store is a later step)
const store = new Map<string, Entry>();

/** Drops IPs with no requests in the current window so the map can't grow without bound */
function prune(now: number): void {
  for (const [key, entry] of store) {
    if (!entry.timestamps.some((t) => now - t < WINDOW_MS)) store.delete(key);
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  if (store.size > MAX_KEYS) prune(now);
  const entry = store.get(ip) ?? { timestamps: [] };

  // Purge timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      retryAfter: Math.ceil((oldest + WINDOW_MS - now) / 1000),
    };
  }

  entry.timestamps.push(now);
  store.set(ip, entry);
  return { allowed: true };
}

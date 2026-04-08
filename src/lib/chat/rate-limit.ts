const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per IP per window

interface Entry {
  timestamps: number[];
}

const store = new Map<string, Entry>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
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

const store = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = (store.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  store.set(ip, timestamps);

  if (store.size > 10000) {
    store.forEach((val, key) => {
      if (val.every((t) => now - t > WINDOW_MS)) store.delete(key);
    });
  }

  return { allowed: true };
}

export function resetRateLimiter(): void {
  store.clear();
}

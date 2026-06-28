import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, resetRateLimiter } from "@/lib/rateLimiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimiter();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
    }
  });

  it("blocks the 21st request within the window", () => {
    for (let i = 0; i < 20; i++) checkRateLimit("1.2.3.4");
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("allows requests after window expires", () => {
    for (let i = 0; i < 20; i++) checkRateLimit("1.2.3.4");
    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
  });
});

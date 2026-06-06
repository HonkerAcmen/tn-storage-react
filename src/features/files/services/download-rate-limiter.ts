export function computeThrottleWaitMs(
  bytes: number,
  rateLimitKbps: number,
  nowMs: number,
  nextAvailableAtMs: number,
): { waitMs: number; nextAvailableAtMs: number } {
  if (rateLimitKbps <= 0 || bytes <= 0) {
    return { waitMs: 0, nextAvailableAtMs };
  }
  const bytesPerMs = (rateLimitKbps * 1024) / 1000;
  const durationMs = bytes / bytesPerMs;
  const startAt = Math.max(nextAvailableAtMs, nowMs);
  const updatedNext = startAt + durationMs;
  const waitMs = Math.max(0, Math.ceil(updatedNext - nowMs));
  return { waitMs, nextAvailableAtMs: updatedNext };
}

export function createDownloadRateLimiter(initialKbps = 0) {
  let rateLimitKbps = initialKbps;
  let nextAvailableAtMs = 0;

  return {
    setLimit(kbps: number) {
      rateLimitKbps = kbps;
      if (rateLimitKbps <= 0) {
        nextAvailableAtMs = 0;
      }
    },
    getLimit() {
      return rateLimitKbps;
    },
    async throttle(bytes: number, nowMs = Date.now()) {
      const result = computeThrottleWaitMs(
        bytes,
        rateLimitKbps,
        nowMs,
        nextAvailableAtMs,
      );
      nextAvailableAtMs = result.nextAvailableAtMs;
      if (result.waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, result.waitMs));
      }
    },
    reset() {
      nextAvailableAtMs = 0;
    },
  };
}

export const MIN_DOWNLOAD_CONCURRENCY = 1;
export const MAX_DOWNLOAD_CONCURRENCY = 5;
export const DEFAULT_DOWNLOAD_CONCURRENCY = 1;
export const DEFAULT_DOWNLOAD_RATE_LIMIT_KBPS = 0;
export const MAX_DOWNLOAD_RATE_LIMIT_KBPS = 102400;

export function clampDownloadConcurrency(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_DOWNLOAD_CONCURRENCY;
  }
  const rounded = Math.round(parsed);
  return Math.min(
    MAX_DOWNLOAD_CONCURRENCY,
    Math.max(MIN_DOWNLOAD_CONCURRENCY, rounded),
  );
}

export function clampDownloadRateLimitKbps(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_DOWNLOAD_RATE_LIMIT_KBPS;
  }
  const rounded = Math.round(parsed);
  if (rounded <= 0) {
    return DEFAULT_DOWNLOAD_RATE_LIMIT_KBPS;
  }
  return Math.min(MAX_DOWNLOAD_RATE_LIMIT_KBPS, rounded);
}

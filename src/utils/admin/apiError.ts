/**
 * 从管理后台 API 错误中提取可读文案
 */
export function getAdminApiErrorMessage(
  err: unknown,
  fallback = '操作失败',
): string {
  if (!err) return fallback;

  if (typeof err === 'string') return err;

  if (err instanceof Error && err.message && err.message !== 'Request failed') {
    return err.message;
  }

  if (typeof err === 'object' && err !== null) {
    const payload = err as Record<string, unknown>;

    const nested = payload.response as Record<string, unknown> | undefined;
    const data =
      (payload.data as Record<string, unknown> | undefined) ??
      (nested?.data as Record<string, unknown> | undefined);

    const candidates = [
      payload.message,
      data?.message,
      nested?.message,
    ];

    for (const item of candidates) {
      if (typeof item === 'string' && item.trim()) {
        return item;
      }
      if (Array.isArray(item) && item.length > 0) {
        return item.map(String).join('；');
      }
    }
  }

  return fallback;
}

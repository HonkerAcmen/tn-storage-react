/**
 * 统一解析后端 API 错误（NestJS { code, message, data?, timestamp? }）
 */

export interface ApiErrorBody {
  code?: number;
  message?: string | string[];
  data?: unknown;
  timestamp?: string;
}

export class ApiError extends Error {
  readonly code?: number;
  readonly status?: number;
  readonly body?: ApiErrorBody;

  constructor(
    message: string,
    options?: { code?: number; status?: number; body?: ApiErrorBody },
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.status = options?.status;
    this.body = options?.body;
  }
}

function formatMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String).join('；');
  }
  return null;
}

function extractFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;

  const payload = body as Record<string, unknown>;
  const nested = payload.response as Record<string, unknown> | undefined;
  const data =
    (payload.data as Record<string, unknown> | undefined) ??
    (nested?.data as Record<string, unknown> | undefined);

  for (const item of [payload.message, data?.message, nested?.message]) {
    const text = formatMessage(item);
    if (text) return text;
  }

  return null;
}

/** 从任意 catch 值中提取后端 message 文案 */
export function getApiErrorMessage(
  err: unknown,
  fallback = '操作失败',
): string {
  if (!err) return fallback;

  if (err instanceof ApiError && err.message) {
    return err.message;
  }

  if (typeof err === 'string' && err.trim()) {
    return err.trim();
  }

  if (err instanceof Error && err.message && err.message !== 'Request failed') {
    return err.message;
  }

  const fromBody = extractFromBody(err);
  if (fromBody) return fromBody;

  return fallback;
}

/** 将 axios 拦截器收到的错误体规范为 ApiError */
export function normalizeApiError(
  err: unknown,
  status?: number,
): ApiError {
  const message = getApiErrorMessage(err, '请求失败');
  const body =
    err && typeof err === 'object' ? (err as ApiErrorBody) : undefined;
  const code =
    typeof body?.code === 'number' ? body.code : status;

  return new ApiError(message, { code, status, body });
}

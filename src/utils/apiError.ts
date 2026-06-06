/**
 * 统一解析后端 API 错误（NestJS { code, message, data?, timestamp? }）
 */

export interface ApiErrorBody {
  code?: number;
  message?: string | string[] | Record<string, unknown>;
  data?: unknown;
  timestamp?: string;
  response?: {
    message?: string | string[] | Record<string, unknown>;
    data?: unknown;
    code?: number;
  };
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

const GENERIC_ERROR_MESSAGES = new Set([
  'Request failed',
  '请求失败',
  'Network Error',
]);

function formatMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String).join('；');
  }
  return null;
}

function extractMessageFromUnknown(value: unknown, depth = 0): string | null {
  if (depth > 5) return null;

  const direct = formatMessage(value);
  if (direct) return direct;

  if (!value || typeof value !== 'object') return null;

  const payload = value as Record<string, unknown>;
  const candidates = [
    payload.message,
    (payload.response as Record<string, unknown> | undefined)?.message,
    (payload.data as Record<string, unknown> | undefined)?.message,
    (payload.body as Record<string, unknown> | undefined)?.message,
  ];

  for (const item of candidates) {
    const text = extractMessageFromUnknown(item, depth + 1);
    if (text) return text;
  }

  return null;
}

function extractFromBody(body: unknown): string | null {
  return extractMessageFromUnknown(body);
}

function isMeaningfulMessage(message: string | undefined): message is string {
  return Boolean(message && !GENERIC_ERROR_MESSAGES.has(message));
}

/** 从任意 catch 值中提取后端 message 文案 */
export function getApiErrorMessage(
  err: unknown,
  fallback = '操作失败',
): string {
  if (!err) return fallback;

  if (err instanceof ApiError) {
    const fromBody = extractFromBody(err.body);
    if (fromBody) return fromBody;
    if (isMeaningfulMessage(err.message)) {
      return err.message;
    }
  }

  if (typeof err === 'string' && err.trim()) {
    return err.trim();
  }

  if (err instanceof Error) {
    const fromBody = extractFromBody(err);
    if (fromBody) return fromBody;
    if (isMeaningfulMessage(err.message)) {
      return err.message;
    }
  }

  if (err && typeof err === 'object') {
    const payload = err as Record<string, unknown>;

    if (payload.response && typeof payload.response === 'object') {
      const response = payload.response as Record<string, unknown>;
      const fromAxiosResponse = extractFromBody(response.data ?? response);
      if (fromAxiosResponse) return fromAxiosResponse;
    }

    const fromBody = extractFromBody(err);
    if (fromBody) return fromBody;
  }

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

import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  cookieOptions,
  type TokenResponse,
} from '@/lib/session';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';

import arMessages from '@/i18n/messages/ar.json';
import enMessages from '@/i18n/messages/en.json';

export type MetadataData = {
  page: string;
  limit: string;
  total: string;
  totalPages: string;
};

export type FieldError = {
  path: string;
  message: string;
};

export interface SuccessResponse<T> {
  status: true;
  code: number;
  message?: string;
  payload: T;
  metadata?: MetadataData;
}

export interface ErrorResponseBody {
  status: false;
  code: number | string;
  message?: string;
  errors?: FieldError[];
  error?: { code?: string; message?: string; details?: unknown };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponseBody;

export interface NormalizedPaginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  payload: T[];
  metadata: MetadataData;
  status: true;
  code: number;
  message?: string;
}

/** Backend error codes → Localized messages. Unknown codes fall back by status. */
export function getLocalizedError(
  code: string,
  status: number,
  locale: 'ar' | 'en' = 'ar',
  fallbackMessage?: string,
): string {
  const dict = locale === 'en' ? enMessages : arMessages;
  const map = dict.errors as Record<string, string>;
  if (map[code]) return map[code];
  if (fallbackMessage && map[fallbackMessage]) return map[fallbackMessage];

  if (status === 401) return dict.errors.UNAUTHORIZED;
  if (status === 403) return dict.errors.FORBIDDEN;
  if (status === 404) return dict.errors.NOT_FOUND;
  if (status === 409) return dict.errors.CONFLICT;
  if (status === 422) return dict.errors.VALIDATION_FAILED;
  if (status >= 500) return dict.errors.INTERNAL_SERVER_ERROR;

  if (
    fallbackMessage &&
    fallbackMessage !== 'An error occurred' &&
    fallbackMessage !== 'Request failed' &&
    !fallbackMessage.startsWith('HTTP ')
  ) {
    return fallbackMessage;
  }

  return dict.errors.generic;
}

function statusCodeToCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_FAILED';
    default:
      return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR';
  }
}

/**
 * Typed error raised for every non-OK backend response. Provides localized
 * user-friendly error messages for both Arabic and English.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly arabicMessage: string;
  readonly englishMessage: string;
  readonly errors?: FieldError[];

  constructor(
    code: string,
    message: string,
    statusCode: number,
    errors?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.errors = errors;
    this.arabicMessage = getLocalizedError(code, statusCode, 'ar', message);
    this.englishMessage = getLocalizedError(code, statusCode, 'en', message);
  }

  getLocalizedMessage(locale?: string): string {
    return locale === 'en' ? this.englishMessage : this.arabicMessage;
  }
}

function parseError(data: unknown, status: number): ApiError {
  const body = data as ErrorResponseBody | null;
  const rawCode = body?.error?.code ?? (body?.code !== undefined ? String(body.code) : undefined);
  const code = rawCode && isNaN(Number(rawCode)) ? rawCode : statusCodeToCode(status);
  const message = body?.message ?? body?.error?.message ?? `HTTP ${status}`;
  return new ApiError(code, message, status, body?.errors);
}

/**
 * Refresh the access token once. In a Server Action / Route Handler the rotated
 * cookies are persisted; in a Server Component render cookies are read-only, so
 * we still return the fresh token for the in-flight retry (best effort).
 */
async function attemptRefresh(): Promise<string | null> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const raw = (await res.json()) as any;
    const data = (raw && typeof raw === 'object' && 'payload' in raw ? raw.payload : raw) as TokenResponse;
    if (!data?.accessToken) return null;

    try {
      jar.set(ACCESS_COOKIE, data.accessToken, cookieOptions);
      jar.set(REFRESH_COOKIE, data.refreshToken, cookieOptions);
      jar.set(
        SESSION_COOKIE,
        JSON.stringify({ id: data.user.id, name: data.user.name, role: data.user.role }),
        cookieOptions,
      );
    } catch {
      // Read-only cookie context (Server Component render) — ignore; retry uses token below.
    }
    return data.accessToken;
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retryToken?: string,
): Promise<T> {
  const jar = await cookies();
  const token = retryToken ?? jar.get(ACCESS_COOKIE)?.value;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Network request failed', 503);
  }

  // One transparent refresh-and-retry on 401.
  if (res.status === 401 && retryToken === undefined) {
    const fresh = await attemptRefresh();
    if (fresh) return request<T>(method, path, body, fresh);
  }

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // non-JSON error body
    }

    // If still 401 after refresh attempt, and this is NOT a login attempt:
    if (res.status === 401 && !path.startsWith('/auth/login')) {
      try {
        jar.delete(ACCESS_COOKIE);
        jar.delete(REFRESH_COOKIE);
        jar.delete(SESSION_COOKIE);
      } catch {
        // Read-only cookie context in render
      }
      redirect('/login?expired=1');
    }

    throw parseError(data, res.status);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return (await res.text()) as unknown as T;
  }

  const json = (await res.json()) as any;

  if (json && typeof json === 'object') {
    // If backend returned an error payload
    if (json.status === false) {
      throw parseError(json, res.status);
    }

    // Standard paginated response: { status: true, code: 200, payload: [...], metadata: { page, limit, total, totalPages } }
    if (json.metadata && 'payload' in json) {
      const page = Number(json.metadata.page ?? 1);
      const pageSize = Number(json.metadata.limit ?? 20);
      const total = Number(json.metadata.total ?? 0);
      const totalPages = Number(json.metadata.totalPages ?? 1);

      const meta = {
        page,
        pageSize,
        total,
        totalPages,
      };

      const paginatedResult: any = {
        status: json.status,
        code: json.code,
        message: json.message,
        data: json.payload,
        meta,
        payload: json.payload,
        metadata: json.metadata,
        [Symbol.iterator]: function* () {
          if (Array.isArray(json.payload)) {
            yield* json.payload;
          }
        },
      };

      return paginatedResult as T;
    }

    // Standard SuccessResponse: { status: true, code: 200, payload: data }
    if ('payload' in json) {
      const payload = json.payload;
      // If payload is an array and does not already have a `.data` property,
      // attach `.data` for backward compatibility with callers expecting { data: Item[] }
      if (Array.isArray(payload) && !('data' in payload)) {
        try {
          Object.defineProperty(payload, 'data', {
            value: payload,
            writable: true,
            enumerable: false,
            configurable: true,
          });
        } catch {
          // ignore if non-extensible
        }
      }
      return payload as T;
    }
  }

  return json as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};

export { API_BASE_URL };

import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ar } from '@/messages/ar';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  cookieOptions,
  type TokenResponse,
} from '@/lib/session';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';

/** Backend error codes → Arabic messages. Unknown codes fall back by status. */
function arabicFor(code: string, status: number): string {
  const map = ar.errors as Record<string, string>;
  if (map[code]) return map[code];
  if (status === 401) return ar.errors.UNAUTHORIZED;
  if (status === 403) return ar.errors.FORBIDDEN;
  if (status >= 500) return ar.errors.INTERNAL_SERVER_ERROR;
  return ar.errors.generic;
}

/**
 * Typed error raised for every non-OK backend response. `arabicMessage` is
 * safe to surface to the user; the raw backend message stays server-side.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly arabicMessage: string;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.arabicMessage = arabicFor(code, statusCode);
  }
}

interface BackendErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

function parseError(data: unknown, status: number): ApiError {
  const body = data as BackendErrorBody | null;
  const code = body?.error?.code ?? (status === 401 ? 'UNAUTHORIZED' : 'ERROR');
  const message = body?.error?.message ?? `HTTP ${status}`;
  return new ApiError(code, message, status);
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

    const data = (await res.json()) as TokenResponse;
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
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};

export { API_BASE_URL };

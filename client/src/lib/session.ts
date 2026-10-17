import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Role } from '@/lib/roles';

export type { Role };

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; name: string; username: string; role: Role };
}

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
export const SESSION_COOKIE = 'session_user';

/** httpOnly session cookies — the browser JS can never read a token. */
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days (refresh token lifetime)
};

const ACCESS_MAX_AGE = 60 * 15; // 15 minutes

/** Read the current session from the httpOnly `session_user` cookie. */
export async function getSession(): Promise<{ user: SessionUser } | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  // A session without any access or refresh token is orphaned / expired.
  const hasToken = Boolean(jar.get(ACCESS_COOKIE)?.value || jar.get(REFRESH_COOKIE)?.value);
  if (!hasToken) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed?.id || !parsed?.role) return null;
    return { user: { id: parsed.id, name: parsed.name ?? '', role: parsed.role } };
  } catch {
    return null;
  }
}

/** Redirect to /login if there is no session. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session.user;
}

/**
 * Server-side role gate. Redirects to /login when unauthenticated and to /403
 * when the role is not allowed. Used by pages/layouts and at the top of every
 * Server Action (hiding links alone is never sufficient).
 */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!roles.includes(session.user.role)) redirect('/403');
  return session.user;
}

/** Persist tokens + session cookie after login/refresh (Server Action/Route Handler only). */
export async function setSessionCookies(data: TokenResponse): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, data.accessToken, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
  jar.set(REFRESH_COOKIE, data.refreshToken, cookieOptions);
  jar.set(
    SESSION_COOKIE,
    JSON.stringify({ id: data.user.id, name: data.user.name, role: data.user.role }),
    cookieOptions,
  );
}

export async function clearSessionCookies(): Promise<void> {
  const jar = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) {
    jar.delete(name);
  }
}

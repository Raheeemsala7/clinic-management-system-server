import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Route Handler: POST /api/auth/logout
 * Best-effort backend logout, then clears auth cookies and redirects to login.
 */
export async function POST(request: Request) {
  const jar = await cookies();
  const accessToken = jar.get('access_token')?.value;

  if (accessToken) {
    const apiBase = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
    } catch {
      // Ignore — we clear cookies regardless.
    }
  }

  for (const name of ['access_token', 'refresh_token', 'session_user']) {
    jar.delete(name);
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

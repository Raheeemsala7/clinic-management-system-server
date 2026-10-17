import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Route Handler: GET /api/realtime/ticket
 *
 * The browser calls this endpoint to get a one-time socket ticket.
 * The server reads the httpOnly access_token cookie (never visible to browser JS),
 * calls the backend POST /auth/socket-ticket, and returns the ticket to the browser.
 *
 * The browser then connects Socket.IO with auth: { ticket }.
 * Tokens never reach the browser.
 */
export async function GET() {
  const jar = cookies();
  const accessToken = jar.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiBase = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiBase}/auth/socket-ticket`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to issue ticket' }, { status: res.status });
    }

    const data = (await res.json()) as { ticket: string; expiresInSeconds: number };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 503 });
  }
}

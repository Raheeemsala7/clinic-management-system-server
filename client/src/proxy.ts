import { NextResponse, type NextRequest } from 'next/server';
import { homePathForRole, sectionRole, type Role } from '@/lib/roles';

const SESSION_COOKIE = 'session_user';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

interface SessionCookie {
  id?: string;
  name?: string;
  role?: Role;
}

function readSession(request: NextRequest): SessionCookie | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  // Don't treat orphaned session cookie as active without tokens
  const hasToken = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value || request.cookies.get(REFRESH_COOKIE)?.value,
  );
  if (!hasToken) return null;

  try {
    const parsed = JSON.parse(raw) as SessionCookie;
    if (!parsed?.id || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Route guard (Next.js 16 `proxy.ts`, formerly middleware.ts).
 *
 * Enforces the role/section boundary at the edge so requests never even reach
 * a page they are not allowed to render. This is defence-in-depth: every page,
 * layout and Server Action also re-checks the role server-side.
 */
export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const session = readSession(request);

  // If expired param is passed, wipe stale session cookies and show login
  if (pathname === '/login') {
    if (searchParams.has('expired')) {
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE);
      res.cookies.delete(ACCESS_COOKIE);
      res.cookies.delete(REFRESH_COOKIE);
      return res;
    }
    if (session) return NextResponse.redirect(new URL(homePathForRole(session.role as Role), request.url));
    return NextResponse.next();
  }

  const required = sectionRole(pathname);
  let res: NextResponse;

  if (!required) {
    res = NextResponse.next();
  } else if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    res = NextResponse.redirect(loginUrl);
  } else if (session.role !== required) {
    res = NextResponse.redirect(new URL('/403', request.url));
  } else {
    res = NextResponse.next();
  }

  // Handle ?lang= or ?locale= query param to sync locale cookie
  const langParam = searchParams.get('lang') || searchParams.get('locale');
  if (langParam === 'ar' || langParam === 'en') {
    res.cookies.set('NEXT_LOCALE', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return res;
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/doctor/:path*', '/reception/:path*'],
};

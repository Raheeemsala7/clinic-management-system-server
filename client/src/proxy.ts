import { NextResponse, type NextRequest } from 'next/server';
import { homePathForRole, sectionRole, type Role } from '@/lib/roles';

const SESSION_COOKIE = 'session_user';

interface SessionCookie {
  id?: string;
  name?: string;
  role?: Role;
}

function readSession(request: NextRequest): SessionCookie | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
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
  const { pathname } = request.nextUrl;
  const session = readSession(request);

  // Already signed in → keep users out of the login screen.
  if (pathname === '/login') {
    if (session) return NextResponse.redirect(new URL(homePathForRole(session.role as Role), request.url));
    return NextResponse.next();
  }

  const required = sectionRole(pathname);
  if (!required) return NextResponse.next();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== required) {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/doctor/:path*', '/reception/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Separate tokens for Customer and Admin
  const adminToken = request.cookies.get('tz_admin_token')?.value;
  const customerToken = request.cookies.get('tz_token')?.value;

  // 2. Attach x-pathname to request headers for Server Components to read
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 3. Routing Guards
  if (pathname.startsWith('/admin')) {
    // Exclude /admin/login from login redirect loops
    if (pathname === '/admin/login') {
      if (adminToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Require admin token for all other /admin/* routes
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  } else if (pathname.startsWith('/dashboard')) {
    // Protect customer dashboard
    if (!customerToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Ensure middleware runs only on relevant path groups
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // Allow /admin and /admin/ (with trailing slash) to handle login
    if (pathname === '/admin' || pathname === '/admin/') {
      return NextResponse.next();
    }

    const adminAuth = request.cookies.get('admin-auth')?.value;
    const validToken = 'admin-secret-token-2024';

    if (adminAuth !== validToken) {
      return NextResponse.redirect(new URL('/admin/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

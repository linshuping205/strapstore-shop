import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJWT(token: string): { userId: string; email: string; role: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.userId || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;
    const user = token ? decodeJWT(token) : null;

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

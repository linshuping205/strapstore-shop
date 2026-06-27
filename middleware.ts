import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function toBase64(str: string): string {
  try {
    return btoa(str);
  } catch {
    // Fallback for environments where btoa is not available
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result += chars.charAt((bitmap >> 18) & 63) + chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    return result;
  }
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Require password to be set and at least 4 characters
    if (!adminPassword || adminPassword.length < 4) {
      return new NextResponse('Admin password not configured', {
        status: 500,
      });
    }

    const expected = 'Basic ' + toBase64('admin:' + adminPassword);

    if (auth !== expected) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
      });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

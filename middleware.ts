import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const expected = 'Basic ' + Buffer.from('admin:' + adminPassword).toString('base64');

    if (!adminPassword || auth !== expected) {
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

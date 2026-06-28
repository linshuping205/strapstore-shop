import { NextResponse } from 'next/server';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'MasterStrap@2024!';
const ADMIN_AUTH_TOKEN = 'admin-secret-token-2024';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const cookieValue = `admin-auth=${ADMIN_AUTH_TOKEN}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/`;

    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieValue,
      },
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

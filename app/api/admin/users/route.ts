import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_TOKEN = 'admin-secret-token-2024';

export async function GET(request: NextRequest) {
  try {
    // Check admin auth via header
    const authHeader = request.headers.get('x-admin-auth');
    if (authHeader !== ADMIN_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Admin users GET error:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Failed to load users: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_TOKEN = 'admin-secret-token-2024';

export interface CategoryStat {
  name: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    if (authHeader !== ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rows = await prisma.post.groupBy({
      by: ['category'],
      _count: { _all: true },
    });

    const data: CategoryStat[] = rows.map((row) => ({
      name: row.category,
      count: row._count._all,
    }));

    data.sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Admin categories GET error:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to load categories: ' + message },
      { status: 500 }
    );
  }
}

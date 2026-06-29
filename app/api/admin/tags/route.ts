import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_TOKEN = 'admin-secret-token-2024';

export interface TagStat {
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

    const posts = await prisma.post.findMany({
      select: { tags: true },
    });

    const tagMap = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags || []) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }

    const data: TagStat[] = Array.from(tagMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    data.sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Admin tags GET error:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to load tags: ' + message },
      { status: 500 }
    );
  }
}

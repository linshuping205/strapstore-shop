export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { tags: true, category: true },
    });

    const tags = [...new Set(posts.flatMap((p) => p.tags))].sort();
    const categories = [...new Set(posts.map((p) => p.category))].sort();

    return NextResponse.json({ success: true, tags, categories });
  } catch (error) {
    console.error('Tags GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

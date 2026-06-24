export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id, published: true },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, content: true, createdAt: true },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Post GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

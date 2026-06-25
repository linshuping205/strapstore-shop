import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { id: true, slug: true, title: true },
        },
      },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Admin comments GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

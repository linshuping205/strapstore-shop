import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ success: true, views: post.views });
  } catch (error) {
    console.error('View POST error:', error);
    return NextResponse.json({ error: 'Failed to count view' }, { status: 500 });
  }
}

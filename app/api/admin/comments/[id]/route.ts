import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.comment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Comment deleted' });
  } catch (error: any) {
    console.error('Admin comment DELETE error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

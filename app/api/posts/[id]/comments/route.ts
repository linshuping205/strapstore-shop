export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, content: true, createdAt: true },
    });
    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.content) {
      return NextResponse.json(
        { error: 'Name, email, and content are required' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId: params.id,
        name: body.name.trim(),
        email: body.email.trim(),
        content: body.content.trim(),
      },
    });
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

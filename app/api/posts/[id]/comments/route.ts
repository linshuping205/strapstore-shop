import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId: params.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, name: true, content: true, createdAt: true },
      }),
      prisma.comment.count({ where: { postId: params.id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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

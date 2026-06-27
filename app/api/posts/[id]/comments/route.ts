import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_COMMENT_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;

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

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length < 1) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (body.content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json({ error: `Content too long (max ${MAX_COMMENT_LENGTH} characters)` }, { status: 400 });
    }
    if (body.name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `Name too long (max ${MAX_NAME_LENGTH} characters)` }, { status: 400 });
    }

    // Simple XSS filter: remove dangerous tags and attributes
    let content = body.content.trim();
    const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'];
    for (const tag of dangerousTags) {
      const regex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
      content = content.replace(regex, '');
    }
    content = content
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, 'blocked:');

    const comment = await prisma.comment.create({
      data: {
        postId: params.id,
        name: body.name.trim().slice(0, MAX_NAME_LENGTH),
        email: body.email.trim().toLowerCase(),
        content: content.slice(0, MAX_COMMENT_LENGTH),
      },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

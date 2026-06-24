export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/posts — 获取所有博客文章（含草稿）
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Admin posts GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/admin/posts — 创建新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const data = {
      title: body.title,
      slug: body.slug,
      content: body.content || '',
      excerpt: body.excerpt || null,
      coverImage: body.coverImage || null,
      category: body.category || 'Guide',
      tags: Array.isArray(body.tags) ? body.tags : [],
      published: body.published === true,
      metaTitle: body.metaTitle || null,
      metaDesc: body.metaDesc || null,
    };

    const post = await prisma.post.create({ data });
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Admin posts POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug already exists. Please use a different slug.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

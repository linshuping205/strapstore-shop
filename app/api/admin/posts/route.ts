import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/posts — list all posts (including drafts)
export async function GET() {
  try {
    // Try prisma ORM first (more reliable than raw SQL)
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log('Admin posts GET findMany:', posts.length, 'posts');
    
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Admin posts GET error:', error.message || error);
    return NextResponse.json(
      { error: 'Database error: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

// POST /api/admin/posts — create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        slug: body.slug,
        title: body.title,
        content: body.content || '',
        excerpt: body.excerpt || null,
        coverImage: body.coverImage || null,
        category: body.category || 'Guide',
        tags: Array.isArray(body.tags) ? body.tags : [],
        published: body.published === true,
        metaTitle: body.metaTitle || null,
        metaDesc: body.metaDesc || null,
      },
    });

    console.log('Admin posts POST created:', post.id, post.title);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Admin posts POST error:', error.message || error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug already exists. Please use a different slug.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create post: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

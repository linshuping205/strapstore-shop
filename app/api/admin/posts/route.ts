import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/posts — 获取所有博客文章（含草稿）
export async function GET() {
  try {
    // 使用原始 SQL 绕过 Prisma Client schema 问题
    const posts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        "id", "slug", "title", "excerpt", "coverImage" as "coverImage", 
        "category", "tags", "published", "likes", "views", "createdAt", "updatedAt"
      FROM "posts"
      ORDER BY "createdAt" DESC
    `);
    return NextResponse.json(posts.map(p => ({
      ...p,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
    })));
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

    const id = 'post_' + Date.now();
    const title = body.title.replace(/'/g, "''");
    const slug = body.slug.replace(/'/g, "''");
    const content = (body.content || '').replace(/'/g, "''");
    const excerpt = (body.excerpt || '').replace(/'/g, "''");
    const coverImage = body.coverImage || '';
    const category = body.category || 'Guide';
    const tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    const published = body.published === true;

    const result = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO "posts" (
        "id", "slug", "title", "content", "excerpt", "coverImage",
        "category", "tags", "published", "likes", "views", "createdAt", "updatedAt"
      ) VALUES (
        '${id}', '${slug}', '${title}', '${content}', '${excerpt}', '${coverImage}',
        '${category}', '${tags}', ${published}, 0, 0, NOW(), NOW()
      )
      RETURNING "id", "slug", "title", "excerpt", "coverImage" as "coverImage",
        "category", "tags", "published", "likes", "views", "createdAt", "updatedAt"
    `);

    const post = result[0];
    post.tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Admin posts POST error:', error);
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Slug already exists. Please use a different slug.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create post: ' + error.message }, { status: 500 });
  }
}

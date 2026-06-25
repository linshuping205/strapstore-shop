import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/posts — list all posts (including drafts)
export async function GET() {
  try {
    const posts = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "slug", "title", "content", "excerpt", "coverImage" as "coverImage",
        "category", "tags", "published", "likes", "views", "metaTitle", "metaDesc",
        "createdAt", "updatedAt"
      FROM "posts" ORDER BY "createdAt" DESC`
    );
    return NextResponse.json(
      posts.map((p) => ({
        ...p,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
        likes: p.likes ?? 0,
        views: p.views ?? 0,
      }))
    );
  } catch (error) {
    console.error('Admin posts GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
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

    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const title = body.title.replace(/'/g, "''");
    const content = (body.content || '').replace(/'/g, "''");
    const excerpt = (body.excerpt || '').replace(/'/g, "''");
    const coverImage = (body.coverImage || '').replace(/'/g, "''");
    const category = (body.category || 'Guide').replace(/'/g, "''");
    const tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    const published = body.published === true;
    const metaTitle = (body.metaTitle || '').replace(/'/g, "''");
    const metaDesc = (body.metaDesc || '').replace(/'/g, "''");

    await prisma.$executeRawUnsafe(
      `INSERT INTO "posts" ("id", "slug", "title", "content", "excerpt", "coverImage",
        "category", "tags", "published", "likes", "views", "metaTitle", "metaDesc", "createdAt", "updatedAt")
      VALUES ('${id}', '${body.slug}', '${title}', '${content}', '${excerpt}', '${coverImage}',
        '${category}', '${tags}', ${published}, 0, 0, '${metaTitle}', '${metaDesc}', NOW(), NOW())`
    );

    const post = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "posts" WHERE "id" = '${id}' LIMIT 1`
    );

    return NextResponse.json(
      {
        ...post[0],
        tags: typeof post[0].tags === 'string' ? JSON.parse(post[0].tags) : (post[0].tags || []),
        likes: post[0].likes ?? 0,
        views: post[0].views ?? 0,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin posts POST error:', error);
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
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

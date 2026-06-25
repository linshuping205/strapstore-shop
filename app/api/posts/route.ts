import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Build query conditions safely with parameter escaping
    const conditions: string[] = ['published = true'];
    if (search) {
      const safeSearch = search.replace(/'/g, "''");
      conditions.push(`(title ILIKE '%${safeSearch}%' OR content ILIKE '%${safeSearch}%')`);
    }
    if (category) {
      conditions.push(`category = '${category.replace(/'/g, "''")}'`);
    }
    if (tag) {
      conditions.push(`tags::text LIKE '%"${tag.replace(/'/g, "''")}"%'`);
    }

    const whereClause = conditions.join(' AND ');

    const postsQuery = `
      SELECT id, slug, title, excerpt, "coverImage" as "coverImage", category, tags,
        likes, views, "createdAt"
      FROM posts
      WHERE ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countQuery = `SELECT COUNT(*) as total FROM posts WHERE ${whereClause}`;

    const posts = await prisma.$queryRawUnsafe<any[]>(postsQuery);
    const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: posts.map((p) => ({
        ...p,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const category = searchParams.get('category') || '';

    const where: any = { published: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (category) {
      where.category = category;
    }

    const skip = (page - 1) * limit;

    // Use raw SQL to ensure coverImage is returned (bypass Prisma Client schema issues)
    let postsQuery = `
      SELECT 
        id, slug, title, excerpt, "coverImage" as "coverImage", category, tags, 
        likes, views, "createdAt"
      FROM posts 
      WHERE published = true
    `;

    if (search) {
      postsQuery += ` AND (title ILIKE '%${search}%' OR content ILIKE '%${search}%')`;
    }
    if (category) {
      postsQuery += ` AND category = '${category}'`;
    }
    if (tag) {
      postsQuery += ` AND tags::text LIKE '%"${tag}"%'`;
    }

    postsQuery += ` ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${skip}`;

    const countQuery = `
      SELECT COUNT(*) as total FROM posts WHERE published = true
      ${search ? ` AND (title ILIKE '%${search}%' OR content ILIKE '%${search}%')` : ''}
      ${category ? ` AND category = '${category}'` : ''}
      ${tag ? ` AND tags::text LIKE '%"${tag}"%'` : ''}
    `;

    const posts = await prisma.$queryRawUnsafe<any[]>(postsQuery);
    const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: posts.map(p => ({
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

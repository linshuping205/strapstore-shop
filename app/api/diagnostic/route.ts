import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {};

  try {
    results.dbConnected = true;

    // 1. Try ORM first
    try {
      const postsOrm = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
      });
      results.postsOrm = {
        count: postsOrm.length,
        items: postsOrm.map((p: any) => ({ id: p.id, title: p.title, slug: p.slug })),
      };
    } catch (e: any) {
      results.postsOrmError = e.message;
    }

    // 2. Fallback: raw SQL count
    try {
      const countRaw = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*) as total FROM "posts"`
      );
      results.postsRawCount = parseInt(countRaw[0]?.total || '0');
    } catch (e: any) {
      results.postsRawCountError = e.message;
    }

    // 3. Raw SQL list
    try {
      const postsRaw = await prisma.$queryRawUnsafe<any[]>(
        `SELECT "id", "title", "slug", "coverImage" as "coverImage", "createdAt" FROM "posts" ORDER BY "createdAt" DESC LIMIT 10`
      );
      results.postsRaw = {
        count: postsRaw.length,
        items: postsRaw.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
      };
    } catch (e: any) {
      results.postsRawError = e.message;
    }

    // 4. Schema info
    try {
      const columns = await prisma.$queryRawUnsafe<any[]>(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts' ORDER BY ordinal_position`
      );
      results.schema = columns.map((c) => ({ name: c.column_name, type: c.data_type }));
    } catch (e: any) {
      results.schemaError = e.message;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        results,
      },
      { status: 500 }
    );
  }
}

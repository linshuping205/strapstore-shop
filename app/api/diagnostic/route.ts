import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results: any = {};

  try {
    results.dbConnected = true;

    try {
      const posts = await prisma.$queryRawUnsafe<any[]>(
        `SELECT "id", "title", "slug", "coverImage" as "coverImage", "createdAt" FROM "posts" ORDER BY "createdAt" DESC`
      );
      results.posts = {
        count: posts.length,
        items: posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          hasCoverImage: !!p.coverImage,
        })),
      };
    } catch (e: any) {
      results.postsError = e.message;
    }

    try {
      const products = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*) as count FROM "products"`
      );
      results.products = {
        count: parseInt(products[0]?.count || '0'),
      };
    } catch (e: any) {
      results.productsError = e.message;
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

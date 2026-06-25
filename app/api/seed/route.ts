import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: string[] = [];

  try {
    // 1. Check current schema and columns
    try {
      const columns = await prisma.$queryRawUnsafe<any[]>(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'posts' ORDER BY ordinal_position
      `);
      results.push('Post columns: ' + columns.map(c => c.column_name).join(', '));
    } catch (e: any) {
      results.push('Schema check error: ' + e.message);
    }

    // 2. Clean old data
    try { await prisma.$executeRawUnsafe(`DELETE FROM "comments"`); } catch { }
    try { await prisma.$executeRawUnsafe(`DELETE FROM "posts"`); } catch { }
    try { await prisma.$executeRawUnsafe(`DELETE FROM "products"`); } catch { }
    try { await prisma.$executeRawUnsafe(`DELETE FROM "orders"`); } catch { }
    try { await prisma.$executeRawUnsafe(`DELETE FROM "order_items"`); } catch { }
    results.push('Old data cleaned');

    // 3. Insert posts with coverImage using raw SQL
    const posts = [
      {
        id: 'post_1',
        slug: 'why-italian-vegetable-tanned-leather',
        title: 'Why Is Italian Vegetable-Tanned Leather Worth a 3-Year Wait?',
        content: '<p>From the oak forests of Tuscany to the finished strap, discover the full lifecycle of vegetable-tanned leather.</p>',
        excerpt: 'From the oak forests of Tuscany to the finished strap.',
        coverImage: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&h=500&fit=crop',
        category: 'Guide',
        tags: ['leather', 'craftsmanship', 'italian'],
        published: true,
        likes: 12,
        views: 345,
      },
      {
        id: 'post_2',
        slug: 'rubber-vs-leather-vs-metal-guide',
        title: 'Rubber vs Leather vs Metal: The Ultimate Strap Material Guide',
        content: '<p>Matching rules for different occasions, seasons, and watch styles.</p>',
        excerpt: 'Matching rules for different occasions.',
        coverImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=500&fit=crop',
        category: 'Tips',
        tags: ['material', 'rubber', 'leather', 'metal'],
        published: true,
        likes: 8,
        views: 210,
      },
      {
        id: 'post_3',
        slug: 'saddle-stitch-workshop-visit',
        title: 'Saddle Stitch: Every Stitch Is a Mark of Time',
        content: '<p>A visit to our handcraft workshop. Learn why traditional saddle stitch outlasts machine sewing.</p>',
        excerpt: 'A visit to our handcraft workshop.',
        coverImage: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=500&fit=crop',
        category: 'Review',
        tags: ['craftsmanship', 'saddle-stitch', 'workshop'],
        published: true,
        likes: 5,
        views: 156,
      },
    ];

    for (const post of posts) {
      try {
        // Try with quoted column name (coverImage)
        await prisma.$executeRawUnsafe(`
          INSERT INTO "posts" (
            "id", "slug", "title", "content", "excerpt", "coverImage",
            "category", "tags", "published", "likes", "views", "createdAt", "updatedAt"
          ) VALUES (
            '${post.id}',
            '${post.slug}',
            '${post.title.replace(/'/g, "''")}',
            '${post.content.replace(/'/g, "''")}',
            '${post.excerpt.replace(/'/g, "''")}',
            '${post.coverImage}',
            '${post.category}',
            '${JSON.stringify(post.tags)}',
            ${post.published},
            ${post.likes},
            ${post.views},
            NOW(),
            NOW()
          )
        `);
        results.push(`Inserted post: ${post.title} with coverImage`);
      } catch (e: any) {
        results.push(`Insert error for ${post.title}: ${e.message}`);
      }
    }

    // 4. Verify data
    try {
      const verifyPosts = await prisma.$queryRawUnsafe<any[]>(`
        SELECT "id", "title", "coverImage" FROM "posts" ORDER BY "id"
      `);
      results.push(`Verified ${verifyPosts.length} posts:`);
      for (const p of verifyPosts) {
        const cover = p.coverImage || p.coverimage || p['coverImage'] || 'NULL';
        results.push(`  - ${p.title}: coverImage=${cover}`);
      }
    } catch (e: any) {
      results.push(`Verify error: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized with raw SQL',
      details: results,
    });
  } catch (error: any) {
    console.error('Seed fatal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Seed failed', details: results },
      { status: 500 }
    );
  }
}

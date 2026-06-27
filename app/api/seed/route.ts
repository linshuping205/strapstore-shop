import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Protect: only allow in development or with explicit flag
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SEED) {
    return NextResponse.json(
      { success: false, error: 'Seed is disabled in production' },
      { status: 403 }
    );
  }

  const results: string[] = [];

  try {
    // 1. Check current schema and columns via Prisma (safe)
    try {
      const posts = await prisma.post.findMany({ take: 1, select: { id: true } });
      results.push('Database connection OK');
    } catch (e: any) {
      results.push('Schema check error: ' + e.message);
    }

    // 2. Check if seed posts already exist
    const existingPosts = await prisma.post.findMany({
      where: { id: { in: ['post_1', 'post_2', 'post_3'] } },
      select: { id: true },
    });
    const existingIds = new Set(existingPosts.map((p) => p.id));
    results.push(`Existing seed posts: ${existingIds.size}`);

    // 3. Only insert missing seed posts (DO NOT delete existing data)
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

    let insertedCount = 0;
    for (const post of posts) {
      if (existingIds.has(post.id)) {
        results.push(`Skipped existing post: ${post.title}`);
        continue;
      }
      try {
        await prisma.post.create({ data: post });
        results.push(`Inserted post: ${post.title}`);
        insertedCount++;
      } catch (e: any) {
        results.push(`Insert error for ${post.title}: ${e.message}`);
      }
    }

    // 4. Also seed products if missing
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: ['prod_1', 'prod_2'] } },
      select: { id: true },
    });
    const existingProdIds = new Set(existingProducts.map((p) => p.id));

    const products = [
      {
        id: 'prod_1',
        slug: 'italian-buttero-leather-strap',
        name: 'Italian Buttero Vegetable-Tanned Leather Strap',
        description: 'Handcrafted from premium Italian vegetable-tanned leather.',
        price: 89.00,
        images: [],
        category: 'Leather',
        material: 'Leather',
        tags: ['leather', 'italian', 'premium'],
        stock: 50,
        sku: 'IBL-001',
        isActive: true,
      },
      {
        id: 'prod_2',
        slug: 'crocodile-embossed-calfskin-strap',
        name: 'Crocodile Embossed Calfskin Strap',
        description: 'Luxurious crocodile pattern embossed on premium calfskin.',
        price: 99.00,
        images: [],
        category: 'Exotic',
        material: 'Calfskin',
        tags: ['exotic', 'crocodile', 'luxury'],
        stock: 30,
        sku: 'CEC-002',
        isActive: true,
      },
    ];

    for (const product of products) {
      if (existingProdIds.has(product.id)) continue;
      try {
        await prisma.product.create({ data: product });
        results.push(`Inserted product: ${product.name}`);
      } catch (e: any) {
        results.push(`Insert product error: ${e.message}`);
      }
    }

    // 5. Verify posts
    try {
      const verifyPosts = await prisma.post.findMany({
        select: { id: true, title: true, coverImage: true },
        orderBy: { id: 'asc' },
        take: 10,
      });
      results.push(`Total posts in DB: ${verifyPosts.length}`);
      for (const p of verifyPosts) {
        const cover = p.coverImage || 'NULL';
        results.push(`  - ${p.title}: coverImage=${cover}`);
      }
    } catch (e: any) {
      results.push(`Verify error: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Safe seed completed (no existing data was deleted)',
      inserted: insertedCount,
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

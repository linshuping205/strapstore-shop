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

    // 2. Check if seed posts already exist
    const existingPosts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id FROM "posts" WHERE id IN ('post_1', 'post_2', 'post_3')
    `);
    const existingIds = new Set(existingPosts.map(p => p.id));
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
        results.push(`Inserted post: ${post.title}`);
        insertedCount++;
      } catch (e: any) {
        results.push(`Insert error for ${post.title}: ${e.message}`);
      }
    }

    // 4. Also seed products if missing (optional)
    const existingProducts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id FROM "products" WHERE id IN ('prod_1', 'prod_2')
    `);
    const existingProdIds = new Set(existingProducts.map(p => p.id));

    const products = [
      {
        id: 'prod_1',
        slug: 'italian-buttero-leather-strap',
        name: 'Italian Buttero Vegetable-Tanned Leather Strap',
        description: 'Handcrafted from premium Italian vegetable-tanned leather.',
        price: 89.00,
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
        await prisma.$executeRawUnsafe(`
          INSERT INTO "products" (
            "id", "slug", "name", "description", "price", "category",
            "material", "tags", "stock", "sku", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            '${product.id}',
            '${product.slug}',
            '${product.name.replace(/'/g, "''")}',
            '${product.description.replace(/'/g, "''")}',
            ${product.price},
            '${product.category}',
            '${product.material}',
            '${JSON.stringify(product.tags)}',
            ${product.stock},
            '${product.sku}',
            ${product.isActive},
            NOW(),
            NOW()
          )
        `);
        results.push(`Inserted product: ${product.name}`);
      } catch (e: any) {
        results.push(`Insert product error: ${e.message}`);
      }
    }

    // 5. Verify posts
    try {
      const verifyPosts = await prisma.$queryRawUnsafe<any[]>(`
        SELECT "id", "title", "coverImage" FROM "posts" ORDER BY "id" LIMIT 10
      `);
      results.push(`Total posts in DB: ${verifyPosts.length}`);
      for (const p of verifyPosts) {
        const cover = p.coverImage || p.coverimage || 'NULL';
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

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { execSync } from 'child_process';
import path from 'path';

const seedData = {
  products: [
    {
      id: 'prod_1',
      slug: 'italian-buttero-leather-strap',
      name: 'Italian Buttero Vegetable-Tanned Leather Strap',
      description: 'Handcrafted from premium Italian vegetable-tanned leather.',
      price: 89.00,
      comparePrice: null,
      images: ['https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=600&fit=crop'],
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
      comparePrice: 129.00,
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop'],
      category: 'Exotic',
      material: 'Calfskin',
      tags: ['exotic', 'crocodile', 'luxury'],
      stock: 30,
      sku: 'CEC-002',
      isActive: true,
    },
  ],
  posts: [
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
      coverImage: 'https://images.unsplash.com/photo-1434056886845-dbe89f8f1db8?w=800&h=500&fit=crop',
      category: 'Review',
      tags: ['craftsmanship', 'saddle-stitch', 'workshop'],
      published: true,
      likes: 5,
      views: 156,
    },
  ],
};

export async function GET() {
  const results: string[] = [];

  try {
    // Step 1: 运行时推送数据库表结构（解决 schema 不匹配）
    try {
      const prismaBin = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');
      const output = execSync(
        `"${prismaBin}" db push --accept-data-loss --skip-generate`,
        {
          cwd: process.cwd(),
          env: process.env,
          timeout: 30000,
          encoding: 'utf-8',
        }
      );
      results.push('Schema pushed: ' + output.split('\n').slice(-3).join('; '));
    } catch (e: any) {
      results.push('Schema push: ' + (e.stderr || e.message || 'failed').split('\n').slice(-3).join('; '));
    }

    // Step 2: 清理旧数据
    try {
      await prisma.comment.deleteMany();
    } catch { /* ignore */ }
    try {
      await prisma.orderItem.deleteMany();
    } catch { /* ignore */ }
    try {
      await prisma.order.deleteMany();
    } catch { /* ignore */ }
    try {
      await prisma.product.deleteMany();
    } catch { /* ignore */ }
    try {
      await prisma.post.deleteMany();
    } catch { /* ignore */ }

    // Step 3: 插入商品
    try {
      await prisma.product.createMany({ data: seedData.products });
      results.push(`Created ${seedData.products.length} products`);
    } catch (e: any) {
      results.push(`Products error: ${e.message}`);
    }

    // Step 4: 插入文章
    try {
      await prisma.post.createMany({ data: seedData.posts });
      results.push(`Created ${seedData.posts.length} posts`);
    } catch (e: any) {
      results.push(`Posts error: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized',
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

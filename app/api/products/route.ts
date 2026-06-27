import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Input validation
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (!body.slug || typeof body.slug !== 'string' || body.slug.trim().length < 1) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }
    const stock = parseInt(body.stock);
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: 'Valid stock is required' }, { status: 400 });
    }

    const images = Array.isArray(body.images)
      ? body.images
      : (body.images
          ? body.images.split(',').map((s: string) => s.trim()).filter(Boolean)
          : []);

    const data = {
      slug: body.slug.trim(),
      name: body.name.trim(),
      description: typeof body.description === 'string' ? body.description.trim() : '',
      price,
      comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
      images,
      category: typeof body.category === 'string' ? body.category.trim() : 'Leather',
      material: typeof body.material === 'string' ? body.material.trim() : '',
      sku: typeof body.sku === 'string' ? body.sku.trim() : `SKU-${Date.now()}`,
      stock,
      metaTitle: typeof body.metaTitle === 'string' ? body.metaTitle.trim() : null,
      metaDesc: typeof body.metaDesc === 'string' ? body.metaDesc.trim() : null,
      tags: [],
      isActive: true,
    };

    const product = await prisma.product.create({ data });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.price !== undefined) data.price = parseFloat(body.price) || 0;
    if (body.comparePrice !== undefined) data.comparePrice = body.comparePrice ? parseFloat(body.comparePrice) : null;
    if (body.images !== undefined) {
      data.images = Array.isArray(body.images)
        ? body.images
        : (body.images ? body.images.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    }
    if (body.category !== undefined) data.category = body.category;
    if (body.material !== undefined) data.material = body.material || null;
    if (body.stock !== undefined) data.stock = parseInt(body.stock) || 0;
    if (body.sku !== undefined) data.sku = body.sku || null;
    if (body.isActive !== undefined) data.isActive = body.isActive === true;
    if (body.metaTitle !== undefined) data.metaTitle = body.metaTitle || null;
    if (body.metaDesc !== undefined) data.metaDesc = body.metaDesc || null;

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product PUT error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug or SKU already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('Product DELETE error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

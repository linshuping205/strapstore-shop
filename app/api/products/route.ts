export const dynamic = 'force-dynamic'

import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const auth = req.headers.get('x-admin-password');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await prisma.product.create({
    data: {
      slug: body.slug,
      name: body.name,
      description: body.description,
      price: body.price,
      comparePrice: body.comparePrice,
      images: body.images,
      category: body.category,
      material: body.material,
      tags: body.tags || [],
      stock: body.stock,
      sku: body.sku,
      metaTitle: body.metaTitle,
      metaDesc: body.metaDesc,
    },
  });

  return NextResponse.json(product);
}

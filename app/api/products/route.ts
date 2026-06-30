import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, handlePrismaError } from '@/lib/api';
import { rateLimit, getRateLimitInfo, tooManyRequestsResponse } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 60, 60000)) {
    const info = getRateLimitInfo(ip, 60, 60000);
    return tooManyRequestsResponse(info.resetAt);
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200, // cap to prevent excessive payload
    });
    return NextResponse.json(products);
  } catch {
    return errorResponse('Database error');
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 10, 60000)) {
    const info = getRateLimitInfo(ip, 10, 60000);
    return tooManyRequestsResponse(info.resetAt);
  }

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
      return errorResponse('Product name is required', 400);
    }
    if (!body.slug || typeof body.slug !== 'string' || body.slug.trim().length < 1) {
      return errorResponse('Slug is required', 400);
    }
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return errorResponse('Valid price is required', 400);
    }
    const stock = parseInt(body.stock);
    if (isNaN(stock) || stock < 0) {
      return errorResponse('Valid stock is required', 400);
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
    return successResponse(product, 201);
  } catch (error) {
    console.error('Create product error:', error);
    return handlePrismaError(error);
  }
}

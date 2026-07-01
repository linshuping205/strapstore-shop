import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, handlePrismaError } from '@/lib/api';
import { rateLimit, getRateLimitInfo, tooManyRequestsResponse } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function ensureVariantTables() {
  try {
    // Check if hasVariants column exists
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "hasVariants" BOOLEAN NOT NULL DEFAULT false
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "order_items" 
      ADD COLUMN IF NOT EXISTS "variantId" TEXT
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "product_variants" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "color" TEXT NOT NULL,
        "colorCode" TEXT,
        "size" TEXT NOT NULL,
        "sku" TEXT NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "comparePrice" DECIMAL(10,2),
        "stock" INTEGER NOT NULL DEFAULT 0,
        "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "product_variants_sku_key" UNIQUE ("sku")
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "product_variants_color_idx" ON "product_variants"("color")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "product_variants_size_idx" ON "product_variants"("size")`);
  } catch (e) {
    console.error('Migration check error:', e);
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 60, 60000)) {
    const info = getRateLimitInfo(ip, 60, 60000);
    return tooManyRequestsResponse(info.resetAt);
  }

  // Ensure tables exist before query
  await ensureVariantTables();

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        variants: {
          where: { isActive: true },
          select: { price: true },
        },
      },
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

    const hasVariants = Array.isArray(body.variants) && body.variants.length > 0;

    const data: any = {
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
      hasVariants,
    };

    if (hasVariants) {
      data.variants = {
        create: body.variants.map((v: any) => ({
          color: v.color || '',
          colorCode: v.colorCode || null,
          size: v.size || '',
          sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          price: parseFloat(v.price) || 0,
          comparePrice: v.comparePrice ? parseFloat(v.comparePrice) : null,
          stock: parseInt(v.stock) || 0,
          images: Array.isArray(v.images) ? v.images : [],
          isActive: v.isActive !== false,
        })),
      };
    }

    const product = await prisma.product.create({ data, include: { variants: true } });
    return successResponse(product, 201);
  } catch (error) {
    console.error('Create product error:', error);
    return handlePrismaError(error);
  }
}

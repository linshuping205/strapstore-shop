import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 1. Add hasVariants column to products if not exists
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "hasVariants" BOOLEAN NOT NULL DEFAULT false
    `);

    // 2. Add variantId to order_items if not exists
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "order_items" 
      ADD COLUMN IF NOT EXISTS "variantId" TEXT
    `);

    // 3. Create product_variants table if not exists
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

    // 4. Add indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "product_variants_color_idx" ON "product_variants"("color")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "product_variants_size_idx" ON "product_variants"("size")`);

    // 5. Add foreign key from order_items to product_variants (if possible)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "order_items" 
        ADD CONSTRAINT "order_items_variantId_fkey" 
        FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
    } catch {
      // FK may already exist or be impossible, ignore
    }

    return NextResponse.json({ success: true, message: 'Migration completed' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

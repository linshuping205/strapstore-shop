import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function ensureCouponsTable() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "coupons" LIMIT 1`;
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.code === 'P2021') {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "coupons" (
          "id" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "value" DECIMAL(10, 2) NOT NULL,
          "minAmount" DECIMAL(10, 2),
          "maxDiscount" DECIMAL(10, 2),
          "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "endDate" TIMESTAMP(3),
          "maxUses" INTEGER NOT NULL DEFAULT 0,
          "usedCount" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "coupons_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "coupons_code_key" UNIQUE ("code")
        )
      `;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons"("code")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "coupons_isActive_idx" ON "coupons"("isActive")`;
    }
  }
  try { await prisma.$executeRaw`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount" DECIMAL(10, 2)`; } catch { /* ignore */ }
  try { await prisma.$executeRaw`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponCode" TEXT`; } catch { /* ignore */ }
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await ensureCouponsTable();
    const body = await request.json();
    const { code, total } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: 'Coupon is not active' }, { status: 400 });
    }

    if (coupon.endDate && new Date() > coupon.endDate) {
      return NextResponse.json({ success: false, error: 'Coupon has expired' }, { status: 400 });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: 'Coupon usage limit reached' }, { status: 400 });
    }

    const subtotal = parseFloat(total);
    if (coupon.minAmount && subtotal < Number(coupon.minAmount)) {
      return NextResponse.json({
        success: false,
        error: `Minimum order amount is $${Number(coupon.minAmount).toFixed(2)}`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * (Number(coupon.value) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.value);
    }
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round((subtotal - discount) * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error('Coupon validate error:', error);
    if (error.message?.includes('does not exist')) {
      return NextResponse.json({ success: false, error: 'Coupons not available' }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: 'Failed to validate coupon' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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

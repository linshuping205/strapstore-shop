import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_TOKEN = 'admin-secret-token-2024';

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-auth');
  if (authHeader !== ADMIN_TOKEN) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = checkAuth(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: coupons.map((c) => ({
        ...c,
        value: Number(c.value),
        minAmount: c.minAmount ? Number(c.minAmount) : null,
        maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Coupons GET error:', error);
    if (error.message?.includes('does not exist')) {
      return NextResponse.json({ success: false, error: 'Coupons table not found. Run: npx prisma db push' }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  if (auth) return auth;

  try {
    const body = await request.json();

    if (!body.code || typeof body.code !== 'string' || body.code.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Code must be at least 3 characters' }, { status: 400 });
    }
    if (!body.type || !['percentage', 'fixed'].includes(body.type)) {
      return NextResponse.json({ success: false, error: 'Type must be percentage or fixed' }, { status: 400 });
    }
    const value = parseFloat(body.value);
    if (isNaN(value) || value <= 0) {
      return NextResponse.json({ success: false, error: 'Valid value is required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.trim().toUpperCase(),
        type: body.type,
        value,
        minAmount: body.minAmount ? parseFloat(body.minAmount) : null,
        maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : 0,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ success: true, data: { ...coupon, value: Number(coupon.value) } }, { status: 201 });
  } catch (error: any) {
    console.error('Coupons POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    }
    if (error.message?.includes('does not exist')) {
      return NextResponse.json({ success: false, error: 'Coupons table not found. Run: npx prisma db push' }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = checkAuth(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.code !== undefined) updateData.code = data.code.trim().toUpperCase();
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = parseFloat(data.value);
    if (data.minAmount !== undefined) updateData.minAmount = data.minAmount ? parseFloat(data.minAmount) : null;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.maxUses !== undefined) updateData.maxUses = parseInt(data.maxUses);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: { ...coupon, value: Number(coupon.value) } });
  } catch (error: any) {
    console.error('Coupons PATCH error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = checkAuth(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Coupons DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete coupon' }, { status: 500 });
  }
}

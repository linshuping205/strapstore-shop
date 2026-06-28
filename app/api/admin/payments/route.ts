import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_TOKEN = 'admin-secret-token-2024';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    if (authHeader !== ADMIN_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Calculate totals
    const totalRevenue = orders
      .filter((o) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + Number(o.total), 0);

    const pendingRevenue = orders
      .filter((o) => o.status === 'PENDING')
      .reduce((sum, o) => sum + Number(o.total), 0);

    const cancelledRevenue = orders
      .filter((o) => o.status === 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.total), 0);

    return NextResponse.json({
      success: true,
      data: orders.map((o) => ({
        ...o,
        total: Number(o.total),
        createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
        updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
      })),
      stats: {
        totalRevenue,
        pendingRevenue,
        cancelledRevenue,
        totalOrders: orders.length,
        paidCount: orders.filter((o) => o.status === 'PAID').length,
        pendingCount: orders.filter((o) => o.status === 'PENDING').length,
        cancelledCount: orders.filter((o) => o.status === 'CANCELLED').length,
      },
    });
  } catch (error: any) {
    console.error('Admin payments GET error:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Failed to load payments' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    if (authHeader !== ADMIN_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Admin payments PATCH error:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Failed to update payment status' }, { status: 500 });
  }
}

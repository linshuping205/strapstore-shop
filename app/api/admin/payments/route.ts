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

    // Load withdrawal data from settings
    let withdrawnTotal = 0;
    let withdrawalHistory: { date: string; amount: number; note: string }[] = [];
    try {
      const withdrawnSetting = await prisma.settings.findUnique({ where: { key: 'withdrawn_total' } });
      if (withdrawnSetting) withdrawnTotal = parseFloat(withdrawnSetting.value) || 0;

      const historySetting = await prisma.settings.findUnique({ where: { key: 'withdrawal_history' } });
      if (historySetting) {
        try {
          withdrawalHistory = JSON.parse(historySetting.value) || [];
        } catch { /* ignore */ }
      }
    } catch { /* settings may not have these keys */ }

    const availableBalance = Math.max(0, totalRevenue - withdrawnTotal);

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
        availableBalance,
        withdrawnTotal,
        totalOrders: orders.length,
        paidCount: orders.filter((o) => o.status === 'PAID').length,
        pendingCount: orders.filter((o) => o.status === 'PENDING').length,
        cancelledCount: orders.filter((o) => o.status === 'CANCELLED').length,
      },
      withdrawalHistory,
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

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    if (authHeader !== ADMIN_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, note } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid amount is required' }, { status: 400 });
    }

    // Get current withdrawn total
    let withdrawnTotal = 0;
    let history: { date: string; amount: number; note: string }[] = [];

    try {
      const withdrawnSetting = await prisma.settings.findUnique({ where: { key: 'withdrawn_total' } });
      if (withdrawnSetting) withdrawnTotal = parseFloat(withdrawnSetting.value) || 0;

      const historySetting = await prisma.settings.findUnique({ where: { key: 'withdrawal_history' } });
      if (historySetting) {
        try { history = JSON.parse(historySetting.value) || []; } catch { /* ignore */ }
      }
    } catch { /* ignore */ }

    // Calculate available balance (need orders again to validate)
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const availableBalance = Math.max(0, totalRevenue - withdrawnTotal);

    if (amount > availableBalance) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    const newWithdrawnTotal = withdrawnTotal + amount;
    const newRecord = { date: new Date().toISOString(), amount, note: note || '' };
    history.unshift(newRecord);
    // Keep only last 50 records
    if (history.length > 50) history = history.slice(0, 50);

    // Upsert settings
    await prisma.settings.upsert({
      where: { key: 'withdrawn_total' },
      update: { value: String(newWithdrawnTotal) },
      create: { key: 'withdrawn_total', value: String(newWithdrawnTotal) },
    });
    await prisma.settings.upsert({
      where: { key: 'withdrawal_history' },
      update: { value: JSON.stringify(history) },
      create: { key: 'withdrawal_history', value: JSON.stringify(history) },
    });

    return NextResponse.json({
      success: true,
      data: { withdrawnTotal: newWithdrawnTotal, availableBalance: totalRevenue - newWithdrawnTotal, record: newRecord },
    });
  } catch (error: any) {
    console.error('Admin payments PUT error:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Failed to process withdrawal' }, { status: 500 });
  }
}

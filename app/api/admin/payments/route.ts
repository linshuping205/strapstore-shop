import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_TOKEN = 'admin-secret-token-2024';

interface PayoutAccount {
  type: 'bank' | 'paypal';
  accountHolder: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  paypalEmail?: string;
}

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
          select: { id: true, productId: true, quantity: true, price: true },
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

  // Load payout account
  let payoutAccount: PayoutAccount | null = null;
  try {
    const payoutSetting = await prisma.settings.findUnique({ where: { key: 'payout_account' } });
    if (payoutSetting) {
      try { payoutAccount = JSON.parse(payoutSetting.value); } catch { /* ignore */ }
    }
  } catch { /* ignore */ }

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
      payoutAccount,
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

    // Save payout account configuration
    if (body.payoutAccount) {
      const account = body.payoutAccount;
      if (!account.accountHolder?.trim()) {
        return NextResponse.json({ success: false, error: 'Account holder name is required' }, { status: 400 });
      }
      if (account.type === 'bank') {
        if (!account.bankName?.trim() || !account.accountNumber?.trim()) {
          return NextResponse.json({ success: false, error: 'Bank name and account number are required' }, { status: 400 });
        }
      } else if (account.type === 'paypal') {
        if (!account.paypalEmail?.trim() || !account.paypalEmail.includes('@')) {
          return NextResponse.json({ success: false, error: 'Valid PayPal email is required' }, { status: 400 });
        }
      }
      await prisma.settings.upsert({
        where: { key: 'payout_account' },
        update: { value: JSON.stringify(account) },
        create: { key: 'payout_account', value: JSON.stringify(account) },
      });
      return NextResponse.json({ success: true, data: account });
    }

    const { id, status, trackingNumber } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Send shipping notification when order is shipped
    if (status === 'SHIPPED' && order.email) {
      try {
        const { sendShippingNotification } = await import('@/lib/email');
        await sendShippingNotification(order.email, order.id, Number(order.total), trackingNumber);
      } catch (e) { /* email may fail silently */ }
    }

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
    const { amount, note, payoutAccount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid amount is required' }, { status: 400 });
    }

    if (!payoutAccount || !payoutAccount.type || !payoutAccount.accountHolder?.trim()) {
      return NextResponse.json({ success: false, error: 'Payout account is required. Please configure a payout account before withdrawing.' }, { status: 400 });
    }

    // Get current withdrawn total
    let withdrawnTotal = 0;
    let history: { date: string; amount: number; note: string; accountType?: string; accountInfo?: string }[] = [];

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

    const accountType = payoutAccount.type === 'paypal' ? 'PayPal' : 'Bank Transfer';
    const accountInfo = payoutAccount.type === 'paypal'
      ? payoutAccount.paypalEmail
      : `${payoutAccount.bankName} - ${payoutAccount.accountNumber?.slice(-4).padStart(payoutAccount.accountNumber.length, '*') || '****'}`;

    const newWithdrawnTotal = withdrawnTotal + amount;
    const newRecord = { date: new Date().toISOString(), amount, note: note || '', accountType, accountInfo };
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

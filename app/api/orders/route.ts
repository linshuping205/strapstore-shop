import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const order = await prisma.order.findFirst({
        where: { stripeSessionId: sessionId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
      return NextResponse.json(order || null);
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Input validation
    const { email, name, address, city, country, postalCode, total, items } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Valid name is required' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }
    if (!total || typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'Valid total amount is required' }, { status: 400 });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }
    }

    // Create order with whitelist fields only
    const order = await prisma.order.create({
      data: {
        email: email.trim(),
        name: name.trim(),
        address: typeof address === 'string' ? address.trim() : '',
        city: typeof city === 'string' ? city.trim() : '',
        country: typeof country === 'string' ? country.trim() : '',
        postalCode: typeof postalCode === 'string' ? postalCode.trim() : '',
        total: Number(total),
        status: 'PENDING',
        stripeSessionId: typeof body.stripeSessionId === 'string' ? body.stripeSessionId : null,
        items: {
          create: items.map((item: any) => ({
            productId: String(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(order);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

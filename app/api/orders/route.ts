import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, handlePrismaError } from '@/lib/api';
import { rateLimit, getRateLimitInfo, tooManyRequestsResponse } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils';

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

    // Pagination for admin orders listing
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          total: true,
          status: true,
          createdAt: true,
          stripeSessionId: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return errorResponse('Database error');
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 orders per minute per IP
  const ip = getClientIp(request);
  if (!rateLimit(ip, 5, 60000)) {
    const info = getRateLimitInfo(ip, 5, 60000);
    return tooManyRequestsResponse(info.resetAt);
  }

  try {
    const body = await request.json();

    const { email, name, address, city, country, postalCode, total, items } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return errorResponse('Valid email is required', 400);
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return errorResponse('Valid name is required', 400);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Items array is required', 400);
    }
    if (!total || typeof total !== 'number' || total <= 0) {
      return errorResponse('Valid total amount is required', 400);
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0) {
        return errorResponse('Invalid item data', 400);
      }
    }

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
          create: items.map((item: Record<string, unknown>) => ({
            productId: String(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
    });

    return successResponse(order, 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    return handlePrismaError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return errorResponse('id and status are required', 400);
    }
    const order = await prisma.order.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(order);
  } catch (error: any) {
    return handlePrismaError(error);
  }
}

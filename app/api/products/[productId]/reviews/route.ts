import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIp } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params;
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const reviews = await prisma.productReview.findMany({
      where: { productId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: reviews.map((r) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      })),
      pagination: { total: reviews.length, page: 1, limit: 100, totalPages: 1 },
    });
  } catch (error: any) {
    console.error('Reviews GET error:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params;
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, rating, title, content } = body;

    if (!name?.trim() || !email?.trim() || !content?.trim() || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Please fill in all required fields with valid rating' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    const review = await prisma.productReview.create({
      data: {
        productId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        rating: Number(rating),
        title: title?.trim() || '',
        content: content.trim(),
        status: 'PENDING',
        ipHash,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Reviews POST error:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}

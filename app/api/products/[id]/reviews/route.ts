import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIp } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const MAX_REVIEW_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;
const MAX_TITLE_LENGTH = 200;

// GET: Fetch approved reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: {
          productId: params.id,
          status: 'APPROVED',
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
        },
      }),
      prisma.productReview.count({
        where: {
          productId: params.id,
          status: 'APPROVED',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST: Submit a new review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length < 1) {
      return NextResponse.json({ error: 'Review content is required' }, { status: 400 });
    }
    if (body.content.length > MAX_REVIEW_LENGTH) {
      return NextResponse.json({ error: `Review too long (max ${MAX_REVIEW_LENGTH} characters)` }, { status: 400 });
    }
    if (body.name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `Name too long (max ${MAX_NAME_LENGTH} characters)` }, { status: 400 });
    }
    if (body.title && body.title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: `Title too long (max ${MAX_TITLE_LENGTH} characters)` }, { status: 400 });
    }

    const rating = Number(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Anti-spam: limit one review per product per email (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId: params.id,
        email: body.email.trim().toLowerCase(),
        createdAt: { gte: oneDayAgo },
      },
    });
    if (existingReview) {
      return NextResponse.json({ error: 'You can only submit one review per product per day' }, { status: 429 });
    }

    // Anti-spam: limit 5 reviews per IP per day
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const ipCount = await prisma.productReview.count({
      where: {
        ipHash,
        createdAt: { gte: oneDayAgo },
      },
    });
    if (ipCount >= 5) {
      return NextResponse.json({ error: 'Too many reviews submitted. Please try again later.' }, { status: 429 });
    }

    // XSS filter for content
    let content = body.content.trim();
    const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'];
    for (const tag of dangerousTags) {
      const regex = new RegExp(`<${tag}\b[^>]*>[\s\S]*?<\/${tag}>`, 'gi');
      content = content.replace(regex, '');
    }
    content = content
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, 'blocked:');

    const review = await prisma.productReview.create({
      data: {
        productId: params.id,
        name: body.name.trim().slice(0, MAX_NAME_LENGTH),
        email: body.email.trim().toLowerCase(),
        rating,
        title: body.title ? body.title.trim().slice(0, MAX_TITLE_LENGTH) : '',
        content: content.slice(0, MAX_REVIEW_LENGTH),
        status: 'PENDING',
        ipHash,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: review.id, message: 'Review submitted for approval' },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Review POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate review detected' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

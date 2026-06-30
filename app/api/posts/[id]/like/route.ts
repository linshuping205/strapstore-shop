import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIp } from '@/lib/utils';
import { rateLimit, getRateLimitInfo, tooManyRequestsResponse } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // Rate limit: 5 likes per minute per IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5, 60000)) {
      const info = getRateLimitInfo(ip, 5, 60000);
      return tooManyRequestsResponse(info.resetAt);
    }

    // Get IP address and hash it
    const ipHash = hashIp(ip);

    // Check if already liked
    let existing = null;
    try {
      existing = await prisma.postInteraction.findUnique({
        where: {
          postId_type_ipHash: {
            postId,
            type: 'like',
            ipHash,
          },
        },
      });
    } catch (e) {
      // Table may not exist — fallback to direct update
      console.log('PostInteraction table not ready, falling back to direct update');
    }

    if (existing) {
      return NextResponse.json({ success: false, error: 'Already liked' }, { status: 429 });
    }

    // Record interaction if table exists
    try {
      await prisma.postInteraction.create({
        data: { postId, type: 'like', ipHash },
      });
    } catch (e) {
      console.log('Skipping PostInteraction create, table not ready');
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('Like POST error:', error);
    return NextResponse.json({ error: 'Failed to like' }, { status: 500 });
  }
}

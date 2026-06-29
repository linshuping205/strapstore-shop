import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, hashIp } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // Get IP address and hash it
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    // Check if already viewed within 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    let existing = null;
    try {
      existing = await prisma.postInteraction.findFirst({
        where: {
          postId,
          type: 'view',
          ipHash,
          createdAt: { gte: oneDayAgo },
        },
      });
    } catch (e) {
      // Table may not exist — fallback to direct update
      console.log('PostInteraction table not ready, falling back to direct update');
    }

    if (existing) {
      // Return current view count without incrementing
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { views: true },
      });
      return NextResponse.json({ success: true, views: post?.views || 0 });
    }

    // Record interaction if table exists
    try {
      await prisma.postInteraction.create({
        data: { postId, type: 'view', ipHash },
      });
    } catch (e) {
      console.log('Skipping PostInteraction create, table not ready');
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true, views: post.views });
  } catch (error) {
    console.error('View POST error:', error);
    return NextResponse.json({ error: 'Failed to count view' }, { status: 500 });
  }
}

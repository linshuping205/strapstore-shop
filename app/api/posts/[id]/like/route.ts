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

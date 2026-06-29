import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use raw query to avoid Prisma relation checks when comments table doesn't exist
    const postResult = await prisma.$queryRaw`
      SELECT id, slug, title, content, excerpt, "coverImage", "coverImageAlt", "coverImageTitle",
             category, tags, published, likes, views, "metaTitle", "metaDesc", "metaKeywords",
             "createdAt", "updatedAt"
      FROM posts
      WHERE id = ${params.id} AND published = true
      LIMIT 1
    `;

    const post = Array.isArray(postResult) && postResult.length > 0 ? postResult[0] : null;

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Try to fetch comments separately (best effort)
    let comments: any[] = [];
    let commentCount = 0;
    try {
      const commentResult = await prisma.$queryRaw`
        SELECT id, name, content, "createdAt"
        FROM comments
        WHERE "postId" = ${params.id}
        ORDER BY "createdAt" DESC
      `;
      comments = Array.isArray(commentResult) ? commentResult : [];
      commentCount = comments.length;
    } catch {
      // comments table doesn't exist — return empty
    }

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        comments,
        _count: { comments: commentCount },
      },
    });
  } catch (error) {
    console.error('Post GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';
import PostActions from '@/components/blog/PostActions';
import PostComments from '@/components/blog/PostComments';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
    });
    if (!post) return { title: 'Not Found' };

    return {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || '',
      openGraph: {
        title: post.title,
        description: post.metaDesc || post.excerpt || '',
        images: post.coverImage ? [{ url: post.coverImage }] : [],
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return { title: 'Not Found' };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    // 简单查询文章（不使用 include，避免 schema 不匹配）
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
    });

    if (!post) {
      console.log('Post not found for slug:', params.slug);
      notFound();
    }

    if (!post.published) {
      console.log('Post found but not published:', params.slug);
      notFound();
    }

    // 单独查询评论数
    let commentCount = 0;
    try {
      commentCount = await prisma.comment.count({
        where: { postId: post.id },
      });
    } catch {
      // 如果 Comment 表不存在，忽略
    }

    return (
      <article className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-amber-700 transition-colors mb-8 inline-block"
          >
            ← Back to Journal
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.coverImage && (
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-10">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <PostActions
            postId={post.id}
            initialLikes={post.likes || 0}
            initialViews={post.views || 0}
            commentCount={commentCount}
          />

          <div
            className="prose prose-lg max-w-none 
              prose-headings:text-gray-900 
              prose-p:text-gray-600 
              prose-a:text-amber-700 hover:prose-a:text-amber-800 
              prose-strong:text-gray-800
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          <PostComments postId={post.id} />
        </div>
      </article>
    );
  } catch (error) {
    console.error('Blog post fetch error:', error);
    notFound();
  }
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import BlogPostActions from './BlogPostActions';
import BlogPostComments from './BlogPostComments';
import { sanitizeHtml } from '@/lib/utils';

async function getSettings() {
  try {
    const s = await prisma.settings.findMany();
    const r: Record<string, string> = {};
    s.forEach((x) => { r[x.key] = x.value; });
    return r;
  } catch { return {}; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [settings, post] = await Promise.all([
    getSettings(),
    prisma.post.findUnique({ where: { slug: params.slug } }).catch(() => null),
  ]);

  const siteTitle = settings.siteTitle || 'MasterStrap';

  if (!post || !post.published) {
    return {
      title: `Not Found | ${siteTitle}`,
      description: 'This page could not be found.',
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDesc || post.excerpt || `Read ${post.title} on ${siteTitle}`;
  const keywords = post.metaKeywords
    ? post.metaKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : (Array.isArray(post.tags) ? post.tags : ['watch strap', 'blog', 'journal']);
  const coverImage = post.coverImage || '/images/og-default.jpg';

  return {
    title: `${title} | ${siteTitle}`,
    description,
    keywords,
    openGraph: {
      title: `${title} | ${siteTitle}`,
      description,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      siteName: siteTitle,
      images: [coverImage],
      tags: Array.isArray(post.tags) ? post.tags : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteTitle}`,
      description,
      images: [coverImage],
    },
    alternates: {
      canonical: `/blog/${post.slug}/`,
    },
  };
}

interface BlogPostPageProps {
  params: { slug: string };
}

// 异步数据加载组件
async function PostData({ slug }: { slug: string }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post || !post.published) {
      notFound();
    }

    let commentCount = 0;
    try {
      commentCount = await prisma.comment.count({
        where: { postId: post.id },
      });
    } catch (e) {
      // Comment table may not exist yet
    }

    return (
      <>
        {/* 文章头部 */}
        <div className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Journal
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            {post.category && (
              <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                {post.category}
              </span>
            )}
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 文章内容 - 已净化 XSS */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* 互动区域 */}
        <div className="border-t border-gray-200 pt-8">
          <BlogPostActions
            postId={post.id}
            initialLikes={post.likes || 0}
            initialViews={post.views || 0}
            commentCount={commentCount}
          />
        </div>

        {/* 评论区域 */}
        <div className="mt-8">
          <BlogPostComments postId={post.id} />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Suspense fallback={
          <div className="space-y-8">
            <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
            </div>
          </div>
        }>
          <PostData slug={params.slug} />
        </Suspense>
      </div>
    </div>
  );
}

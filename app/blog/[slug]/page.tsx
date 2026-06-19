import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const prisma = getPrismaClient();
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: 'Not Found' };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.excerpt || post.content.slice(0, 160),
    alternates: { canonical: `/blog/${post.slug}/` },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const prisma = getPrismaClient();
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {post.coverImage && (
          <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8">
            <Image src={post.coverImage} alt={post.title} width={1200} height={514} className="object-cover w-full h-full" />
          </div>
        )}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 mb-8">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
      </article>
    </>
  );
}

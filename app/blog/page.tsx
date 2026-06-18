import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Expert guides on watch straps, care tips, and style inspiration.',
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Journal</h1>
      <p className="text-gray-500 mb-8">Expert guides and style inspiration</p>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/blog/${post.slug}/`}>
              <div className="aspect-[16/9] bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={600}
                    height={340}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">{post.title}</h3>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

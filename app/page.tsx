import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export const revalidate = 3600;

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
}

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { published: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });
}

export default async function HomePage() {
  const products = await getFeaturedProducts();
  const posts = await getLatestPosts();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MasterStrap',
    url: process.env.NEXT_PUBLIC_APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_APP_URL}/products/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Crafted for the <span className="text-accent">Discerning</span> Wrist
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Hand-selected leathers, surgical-grade rubber, and brushed stainless steel. 
                Every strap tells a story of precision engineering.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products/" className="btn-primary">
                  Explore Collection
                </Link>
                <Link href="/blog/strap-guide/" className="px-6 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  Read Strap Guide
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-straps.jpg"
                alt="Premium leather and metal watch straps collection"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Collection</h2>
            <p className="text-gray-500">Curated straps for every occasion</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Why MasterStrap?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8 text-left">
            <div>
              <h3 className="font-semibold text-lg mb-2">Artisanal Craft</h3>
              <p className="text-gray-500 text-sm">
                Each strap undergoes 23 stages of hand-finishing in our partner ateliers across Italy and Germany.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Perfect Fit Guarantee</h3>
              <p className="text-gray-500 text-sm">
                Not satisfied? Return within 30 days for a full refund. No questions asked.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Global Shipping</h3>
              <p className="text-gray-500 text-sm">
                DHL Express delivery to 180+ countries. Track every step of the journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">From the Journal</h2>
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
                  <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

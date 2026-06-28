import { Product, Post } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';
import Craftsmanship from '@/components/Craftsmanship';
import Testimonials from '@/components/Testimonials';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getFeaturedProducts() {
  try {
    const { prisma } = await import('@/lib/prisma');
    return await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error: any) {
    console.error('DB Error (products):', error.message);
    return [];
  }
}

async function getLatestPosts() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    return posts;
  } catch (error: any) {
    console.error('DB Error (posts):', error.message);
    return [];
  }
}

export default async function HomePage() {
  let products: Product[] = [];
  let posts: Post[] = [];

  try {
    [products, posts] = await Promise.all([
      getFeaturedProducts(),
      getLatestPosts(),
    ]);
  } catch (err: any) {
    console.error('HomePage error:', err);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
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

      <HeroBanner />
      <Craftsmanship />

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[3px] uppercase text-accent font-semibold mb-4 inline-block">Featured Collection</span>
            <h2 className="font-heading text-[clamp(1.8rem,3.2vw,2.6rem)] font-normal mb-4 leading-tight">This Season&apos;s Featured Straps</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-light text-lg leading-relaxed">From classic business to sporty casual, find the perfect companion for your timepiece.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <>
                <div className="group bg-white rounded overflow-hidden border border-gray-100 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-transparent transition-all cursor-pointer">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <span className="absolute top-4 left-4 bg-accent text-white text-[10px] px-3.5 py-1.5 rounded-full font-semibold tracking-wider uppercase z-10">New</span>
                    <Image src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=600&fit=crop" alt="Italian Buttero Leather Strap" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] tracking-[1.5px] uppercase text-accent font-semibold mb-2.5">Leather</div>
                    <h3 className="font-heading text-base font-medium mb-3.5 leading-snug"><Link href="/products/" className="hover:text-accent transition-colors">Italian Buttero Vegetable-Tanned Leather Strap</Link></h3>
                    <div className="flex items-center gap-2 text-sm"><span className="font-heading text-lg font-semibold text-accent">$89.00</span></div>
                  </div>
                </div>
                <div className="group bg-white rounded overflow-hidden border border-gray-100 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-transparent transition-all cursor-pointer">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop" alt="Crocodile Embossed Calfskin Strap" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] tracking-[1.5px] uppercase text-accent font-semibold mb-2.5">Exotic</div>
                    <h3 className="font-heading text-base font-medium mb-3.5 leading-snug"><Link href="/products/" className="hover:text-accent transition-colors">Crocodile Embossed Calfskin Strap</Link></h3>
                    <div className="flex items-center gap-2 text-sm"><span className="text-gray-400 line-through text-xs">$129.00</span><span className="font-heading text-lg font-semibold text-accent">$99.00</span></div>
                  </div>
                </div>
                <div className="group bg-white rounded overflow-hidden border border-gray-100 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-transparent transition-all cursor-pointer">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <span className="absolute top-4 left-4 bg-accent text-white text-[10px] px-3.5 py-1.5 rounded-full font-semibold tracking-wider uppercase z-10">Best</span>
                    <Image src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop" alt="Aerospace Fluoroelastomer Strap" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] tracking-[1.5px] uppercase text-accent font-semibold mb-2.5">Rubber</div>
                    <h3 className="font-heading text-base font-medium mb-3.5 leading-snug"><Link href="/products/" className="hover:text-accent transition-colors">Aerospace Fluoroelastomer Sport Strap</Link></h3>
                    <div className="flex items-center gap-2 text-sm"><span className="font-heading text-lg font-semibold text-accent">$59.00</span></div>
                  </div>
                </div>
                <div className="group bg-white rounded overflow-hidden border border-gray-100 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-transparent transition-all cursor-pointer">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop" alt="High-Density Woven Nylon Strap" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] tracking-[1.5px] uppercase text-accent font-semibold mb-2.5">Nylon</div>
                    <h3 className="font-heading text-base font-medium mb-3.5 leading-snug"><Link href="/products/" className="hover:text-accent transition-colors">High-Density Woven Nylon Strap</Link></h3>
                    <div className="flex items-center gap-2 text-sm"><span className="font-heading text-lg font-semibold text-accent">$45.00</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="text-center mt-16">
            <Link href="/products/" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[3px] uppercase text-accent font-semibold mb-4 inline-block">Journal</span>
            <h2 className="font-heading text-[clamp(1.8rem,3.2vw,2.6rem)] font-normal mb-4 leading-tight">Craft & Stories</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-light text-lg leading-relaxed">Explore the material science, heritage, and styling aesthetics behind every strap.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}/`}>
                    <div className="aspect-[16/10] rounded-lg overflow-hidden mb-6 relative bg-gray-100">
                      {post.coverImage && (
                        <Image src={post.coverImage} alt={post.title} width={800} height={500} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400 mb-3.5 uppercase tracking-wider">
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h3 className="font-heading text-xl font-medium leading-snug mb-3.5 group-hover:text-accent transition-colors">{post.title}</h3>
                    <p className="text-sm text-gray-500 leading-7 mb-5 line-clamp-2">{post.excerpt}</p>
                    <span className="text-xs font-semibold uppercase tracking-[1.5px] text-accent hover:text-yellow-700 transition-colors inline-flex items-center gap-1.5 group-hover:gap-2.5">Read More →</span>
                  </Link>
                </article>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-400 text-lg mb-4">No articles in the database yet.</p>
                <a href="/admin/blogs/" className="text-accent hover:text-yellow-700 underline text-sm">
                  Go to Admin → Blog Posts to create content
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <Testimonials />
    </>
  );
}

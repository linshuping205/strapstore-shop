import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/AddToCart';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDesc || product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
      type: 'product',
    },
    alternates: {
      canonical: `/products/${product.slug}/`,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product || !product.isActive) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'MasterStrap' },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}/`,
      priceCurrency: 'USD',
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
              <Image
                src={product.images[0] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
                    <Image src={img} alt={`${product.name} view ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-accent font-medium uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-semibold">${Number(product.price).toFixed(2)}</span>
                {product.comparePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ${Number(product.comparePrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="border-t border-b border-gray-100 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Material</span>
                <span className="font-medium">{product.material}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SKU</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stock</span>
                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            <AddToCart product={product} />
          </div>
        </div>
      </div>
    </>
  );
}

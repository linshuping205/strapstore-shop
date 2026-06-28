import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import ProductReviews from '@/components/products/ProductReviews';
import { ArrowLeft, Truck, Shield, RotateCcw, Star, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) notFound();

  const [relatedProducts, approvedReviews] = await Promise.all([
    prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productReview.findMany({
      where: { productId: product.id, status: 'APPROVED' },
      select: { rating: true },
    }),
  ]);

  const hasComparePrice = product.comparePrice && Number(product.comparePrice) > Number(product.price);
  const discount = hasComparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : 0;

  const avgRating = approvedReviews.length > 0
    ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length) * 10) / 10
    : 0;
  const reviewCount = approvedReviews.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link href="/products/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
              {product.images && product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package size={64} />
                </div>
              )}
              {hasComparePrice && discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="120px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-accent uppercase tracking-wider font-semibold mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {reviewCount > 0 ? `${avgRating} · ${reviewCount} Review${reviewCount > 1 ? 's' : ''}` : 'No reviews yet'}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">${formatPrice(product.price)}</span>
              {hasComparePrice && (
                <span className="text-xl text-gray-400 line-through">${formatPrice(product.comparePrice)}</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Package size={16} className="text-accent" />
                SKU: {product.sku || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield size={16} className="text-accent" />
                Material: {product.material || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck size={16} className="text-accent" />
                Free Shipping
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <RotateCcw size={16} className="text-accent" />
                30-Day Returns
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <AddToCartButton product={product} disabled={product.stock <= 0} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}/`} className="group">
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                  {p.images && p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={32} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{p.category}</p>
                <h3 className="font-medium text-gray-900 group-hover:text-accent transition-colors mb-1">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${formatPrice(p.price)}</span>
                  {p.comparePrice && Number(p.comparePrice) > Number(p.price) && (
                    <span className="text-sm text-gray-400 line-through">${formatPrice(p.comparePrice)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Product Reviews */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-100">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}

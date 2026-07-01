import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductReviews from '@/components/products/ProductReviews';
import ProductGallery from '@/components/products/ProductGallery';
import ProductVariantSelector from './ProductVariantSelector';
import { ArrowLeft, Truck, Shield, RotateCcw, Star, Package, Ruler, CheckCircle } from 'lucide-react';
import { formatPrice, serializeProduct, serializeProducts } from '@/lib/utils';
import type { Product } from '@/types';

export const revalidate = 60; // ISR: re-generate every 60 seconds

async function getSettings() {
  try {
    const s = await prisma.settings.findMany();
    const r: Record<string, string> = {};
    s.forEach((x) => { r[x.key] = x.value; });
    return r;
  } catch { return {}; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const settings = await getSettings();
  const siteTitle = settings.siteTitle || 'MasterStrap';

  let product: any = null;
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT name, description, "metaTitle", "metaDesc", images, price, "comparePrice", stock, sku, category, material, slug FROM products WHERE slug = $1 AND "isActive" = true LIMIT 1`,
      params.slug
    );
    product = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch {
    // Database may not be available during build
  }

  if (!product) {
    return {
      title: `Not Found | ${siteTitle}`,
      description: 'This product could not be found.',
    };
  }

  const title = product.metaTitle || product.name;
  const description = product.metaDesc || product.description || `Buy ${product.name} at ${siteTitle}`;
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];

  return {
    title: `${title} | ${siteTitle}`,
    description,
    keywords: [product.category, product.material, 'watch strap', 'watch band'].filter(Boolean),
    openGraph: {
      title: `${title} | ${siteTitle}`,
      description,
      type: 'website',
      images: images.length > 0 ? images.slice(0, 4) : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteTitle}`,
      description,
      images: images.length > 0 ? [images[0]] : [],
    },
    alternates: {
      canonical: `/products/${product.slug}/`,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product: any;
  let relatedProducts: any[] = [];
  let approvedReviews: any[] = [];

  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });
  } catch (err: any) {
    console.error('ProductPage DB error:', err?.message || err);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Product Unavailable</h1>
          <p className="text-gray-500 mb-6">We&apos;re having trouble loading this product. Please check back later or browse our collection.</p>
          <Link href="/products/" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
            <ArrowLeft size={18} /> Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) notFound();

  try {
    [relatedProducts, approvedReviews] = await Promise.all([
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
  } catch (err: any) {
    console.error('ProductPage related/reviews DB error:', err?.message || err);
    // Continue with empty arrays — main product is still shown
  }

  const serializedProduct = serializeProduct(product) as Product;
  const serializedRelatedProducts = serializeProducts(relatedProducts) as Product[];

  const comparePrice = serializedProduct.comparePrice;
  const hasComparePrice = comparePrice !== null && comparePrice > serializedProduct.price;
  const discount = hasComparePrice
    ? Math.round((1 - serializedProduct.price / comparePrice) * 100)
    : 0;

  const avgRating = approvedReviews.length > 0
    ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length) * 10) / 10
    : 0;
  const reviewCount = approvedReviews.length;

  return (
    <div>
      {/* JSON-LD Product Structured Data */}
      {(() => {
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: serializedProduct.name,
          image: serializedProduct.images || [],
          description: serializedProduct.description,
          sku: serializedProduct.sku,
          brand: { '@type': 'Brand', name: 'MasterStrap' },
          offers: {
            '@type': 'Offer',
            url: `https://strapstore-shop.vercel.app/products/${serializedProduct.slug}/`,
            priceCurrency: 'USD',
            price: formatPrice(serializedProduct.price),
            availability: serializedProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
          ...(reviewCount > 0 ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: String(avgRating),
              reviewCount: String(reviewCount),
            },
          } : {} as any),
        };
        return React.createElement('script', {
          type: 'application/ld+json',
          dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
        });
      })()}
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
          {/* Left: Image Gallery */}
          <ProductGallery
            images={serializedProduct.images || []}
            name={serializedProduct.name}
            hasDiscount={hasComparePrice}
            discount={discount}
          />

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-accent uppercase tracking-wider font-semibold mb-2">{serializedProduct.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{serializedProduct.name}</h1>
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

            <div
              className="text-gray-600 leading-relaxed product-description"
              dangerouslySetInnerHTML={{ __html: serializedProduct.description || '' }}
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield size={16} className="text-accent" />
                Material: {serializedProduct.material || 'N/A'}
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

            {serializedProduct.tags && serializedProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {serializedProduct.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <ProductVariantSelector product={serializedProduct} />
          </div>
          </div>
        </div>
      </div>

      {/* Product Specs */}
      <div id="product-specs" className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Ruler size={20} className="text-amber-600" />
              Product Specifications
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600 w-40">Product Name</td>
                    <td className="px-6 py-4 text-gray-900">{serializedProduct.name}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">SKU</td>
                    <td className="px-6 py-4 text-gray-900 font-mono">{serializedProduct.sku || 'N/A'}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">Category</td>
                    <td className="px-6 py-4 text-gray-900">{serializedProduct.category}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">Material</td>
                    <td className="px-6 py-4 text-gray-900">{serializedProduct.material || 'N/A'}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">Price</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">${formatPrice(serializedProduct.price)}</td>
                  </tr>
                  {hasComparePrice && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-600">Compare Price</td>
                      <td className="px-6 py-4 text-gray-400 line-through">${formatPrice(serializedProduct.comparePrice)}</td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">Stock</td>
                    <td className="px-6 py-4">
                      <span className={serializedProduct.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                        {serializedProduct.stock > 0 ? `${serializedProduct.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">Shipping</td>
                    <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Free Shipping Worldwide
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">Returns</td>
                    <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      30-Day Money Back Guarantee
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Why Choose MasterStrap?</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  Handcrafted from premium full-grain leather
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  Stainless steel buckle hardware
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  Compatible with all major watch brands
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  Free shipping on all orders
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  30-day hassle-free returns
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {serializedRelatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {serializedRelatedProducts.map((p) => (
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
                  {p.comparePrice && p.comparePrice > p.price && (
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
        <ProductReviews productId={serializedProduct.id} />
      </div>
    </div>
  );
}

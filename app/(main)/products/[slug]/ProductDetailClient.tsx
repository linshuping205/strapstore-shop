'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Product } from '@/types';
import ProductGallery from '@/components/products/ProductGallery';
import AddToCartButton from './AddToCartButton';
import ProductReviews from '@/components/products/ProductReviews';
import { formatPrice } from '@/lib/utils';
import { Star, Shield, Truck, RotateCcw, ArrowLeft, Ruler, CheckCircle, Package } from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  avgRating: number;
  reviewCount: number;
}

export default function ProductDetailClient({ product, relatedProducts, avgRating, reviewCount }: ProductDetailClientProps) {
  const variants = product.variants || [];
  const hasVariants = product.hasVariants && variants.length > 0;

  // --- Variant state ---
  const colors = useMemo(() => {
    const map = new Map<string, { color: string; colorCode?: string | null; images: string[] }>();
    variants.forEach((v) => {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, colorCode: v.colorCode, images: v.images || [] });
      }
    });
    return Array.from(map.values());
  }, [variants]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => set.add(v.size));
    return Array.from(set);
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.color || '');
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null;
  }, [hasVariants, variants, selectedColor, selectedSize]);

  // --- Dynamic images based on selected variant ---
  const currentImages = useMemo(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    return product.images || [];
  }, [selectedVariant, product.images]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentComparePrice = selectedVariant ? selectedVariant.comparePrice : product.comparePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  const availableSizesForColor = useMemo(() => {
    return new Set(variants.filter((v) => v.color === selectedColor).map((v) => v.size));
  }, [variants, selectedColor]);

  // Auto-correct size when color changes
  useMemo(() => {
    if (!hasVariants) return;
    if (!availableSizesForColor.has(selectedSize)) {
      const firstAvailable = variants.find((v) => v.color === selectedColor)?.size;
      if (firstAvailable) setSelectedSize(firstAvailable);
    }
  }, [selectedColor]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasComparePrice = product.comparePrice != null && product.price < product.comparePrice;
  const discount = hasComparePrice
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const faqs = [
    { q: 'What material is this strap made from?', a: `This ${product.name} is crafted from ${product.material || 'premium-grade material'} with reinforced stitching for durability.` },
    { q: 'Will this fit my watch?', a: `It fits any watch with standard lug width. Check your watch caseback for exact size.` },
    { q: 'How do I install the strap?', a: 'Included spring bar tool makes installation easy. Full instructions provided with every order.' },
    { q: 'What is the return policy?', a: '30-day hassle-free returns. If you are not satisfied, return for a full refund.' },
  ];

  return (
    <div>
      {/* JSON-LD Product Structured Data */}
      {(() => {
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.images || [],
          description: product.description,
          sku: product.sku,
          brand: { '@type': 'Brand', name: 'MasterStrap' },
          offers: {
            '@type': 'Offer',
            url: `https://strapstore-shop.vercel.app/products/${product.slug}/`,
            priceCurrency: 'USD',
            price: formatPrice(currentPrice),
            availability: currentStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
            {/* Left: Image Gallery — DYNAMIC images */}
            <ProductGallery
              images={currentImages}
              name={product.name}
              hasDiscount={discount > 0}
              discount={discount}
            />

            {/* Right: Product Info */}
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

              <div
                className="text-gray-600 leading-relaxed product-description"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />

              <div className="grid grid-cols-2 gap-4 text-sm">
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

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Dynamic Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">${formatPrice(currentPrice)}</span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="text-xl text-gray-400 line-through">${formatPrice(currentComparePrice)}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-50 text-red-600 text-sm font-bold px-2 py-1 rounded">-{discount}%</span>
                )}
              </div>

              {/* Stock / SKU */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={currentStock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {currentStock > 0 ? `In Stock (${currentStock})` : 'Out of Stock'}
                </span>
                <span className="text-gray-300">|</span>
                <span>SKU: {currentSku}</span>
              </div>

              {/* Variant Selector */}
              {hasVariants && (
                <div className="space-y-6">
                  {/* Color */}
                  {colors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Color: <span className="text-gray-900">{selectedColor}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        {colors.map((c) => (
                          <button
                            key={c.color}
                            onClick={() => setSelectedColor(c.color)}
                            className={`group relative w-10 h-10 rounded-full border-2 transition-all ${
                              selectedColor === c.color
                                ? 'border-amber-500 ring-2 ring-amber-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={c.color}
                          >
                            <span className="absolute inset-1 rounded-full" style={{ backgroundColor: c.colorCode || '#ccc' }} />
                            {selectedColor === c.color && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size */}
                  {sizes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Size: <span className="text-gray-900">{selectedSize}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                          const disabled = !availableSizesForColor.has(size);
                          return (
                            <button
                              key={size}
                              disabled={disabled}
                              onClick={() => !disabled && setSelectedSize(size)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                selectedSize === size
                                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                                  : disabled
                                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add to Cart */}
              <AddToCartButton
                product={product}
                variant={selectedVariant}
                disabled={currentStock <= 0}
              />
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
                      <td className="px-6 py-4 text-gray-900">{product.name}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-600">SKU</td>
                      <td className="px-6 py-4 text-gray-900 font-mono">{currentSku || 'N/A'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-600">Category</td>
                      <td className="px-6 py-4 text-gray-900">{product.category}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-600">Material</td>
                      <td className="px-6 py-4 text-gray-900">{product.material || 'N/A'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-600">Price</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">${formatPrice(currentPrice)}</td>
                    </tr>
                    {hasComparePrice && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-600">Compare Price</td>
                        <td className="px-6 py-4 text-gray-400 line-through">${formatPrice(currentComparePrice)}</td>
                      </tr>
                    )}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-600">Stock</td>
                      <td className="px-6 py-4">
                        <span className={currentStock > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                          {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
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

        {/* FAQ */}
        <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
          <h2 className="text-xl font-bold mb-6">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group bg-gray-50 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-medium text-gray-900">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-3 text-sm text-gray-600">{faq.a}</div>
              </details>
            ))}
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
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}

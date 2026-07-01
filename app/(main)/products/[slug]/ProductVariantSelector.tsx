'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/types';
import AddToCartButton from './AddToCartButton';
import { formatPrice } from '@/lib/utils';

export default function ProductVariantSelector({ product }: { product: Product }) {
  const variants = product.variants || [];
  const hasVariants = product.hasVariants && variants.length > 0;

  // Extract unique colors and sizes
  const colors = useMemo(() => {
    const map = new Map<string, { color: string; colorCode?: string | null; image?: string }>();
    variants.forEach((v) => {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, colorCode: v.colorCode, image: v.images?.[0] });
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

  // Find selected variant
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null;
  }, [hasVariants, variants, selectedColor, selectedSize]);

  // Current display values
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentComparePrice = selectedVariant ? selectedVariant.comparePrice : product.comparePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  // Available sizes for selected color
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

  if (!hasVariants) {
    return <AddToCartButton product={product} variant={null} disabled={product.stock <= 0} />;
  }

  return (
    <div className="space-y-6">
      {/* Color Selector */}
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
                <span
                  className="absolute inset-1 rounded-full"
                  style={{ backgroundColor: c.colorCode || '#ccc' }}
                />
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

      {/* Size Selector */}
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

      {/* Dynamic Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">${formatPrice(currentPrice)}</span>
        {currentComparePrice && currentComparePrice > currentPrice && (
          <span className="text-xl text-gray-400 line-through">${formatPrice(currentComparePrice)}</span>
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

      {/* Add to Cart */}
      <AddToCartButton
        product={product}
        variant={selectedVariant}
        disabled={currentStock <= 0}
      />
    </div>
  );
}

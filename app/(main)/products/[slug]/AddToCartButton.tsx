'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store'
import { ShoppingCart, Check, Package } from 'lucide-react'
import { Product, ProductVariant } from '@/types'

interface AddToCartButtonProps {
  product: Product
  variant?: ProductVariant | null
  disabled?: boolean
}

export default function AddToCartButton({ product, variant, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCart((state) => state.addItem)

  const isDisabled = disabled || (variant ? variant.stock <= 0 : product.stock <= 0)
  const maxQty = variant ? variant.stock : product.stock

  const handleClick = () => {
    if (isDisabled) return
    const itemId = variant ? variant.id : product.id
    const itemName = variant
      ? `${product.name} — ${variant.color} / ${variant.size}`
      : product.name
    const itemPrice = variant ? variant.price : product.price
    const itemImage = variant?.images?.[0] || product.images?.[0] || ''

    addItem({
      id: itemId,
      productId: product.id,
      name: product.name,
      variantName: variant ? `${variant.color} / ${variant.size}` : undefined,
      price: Number(itemPrice),
      image: itemImage,
      quantity,
      slug: product.slug,
      color: variant?.color,
      size: variant?.size,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {!isDisabled && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <span className="px-3 py-2 text-sm font-medium w-10 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty || 99, q + 1))}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all ${
          isDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/20'
        }`}
      >
        {isDisabled ? (
          <>
            <Package size={18} /> Out of Stock
          </>
        ) : added ? (
          <>
            <Check size={18} /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={18} /> Add to Cart — ${(Number(variant ? variant.price : product.price) * quantity).toFixed(2)}
          </>
        )}
      </button>
    </div>
  )
}

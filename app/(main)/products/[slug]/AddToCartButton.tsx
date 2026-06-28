'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store'
import { ShoppingCart, Check, Package } from 'lucide-react'
import { Product } from '@/types'

export default function AddToCartButton({ product, disabled }: { product: Product; disabled?: boolean }) {
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCart((state) => state.addItem)

  const handleClick = () => {
    if (disabled) return
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] || '',
      quantity,
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {!disabled && (
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
              onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
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
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/20'
        }`}
      >
        {disabled ? (
          <>
            <Package size={18} /> Out of Stock
          </>
        ) : added ? (
          <>
            <Check size={18} /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={18} /> Add to Cart — ${(Number(product.price) * quantity).toFixed(2)}
          </>
        )}
      </button>
    </div>
  )
}

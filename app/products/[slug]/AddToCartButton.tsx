'use client'

import { useCartStore } from '@/lib/store'

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart)

  return (
    <button
      onClick={() => addToCart(product)}
      className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      Add to Cart
    </button>
  )
}

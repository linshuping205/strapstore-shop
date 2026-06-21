'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store'

export default function AddToCartButton({ product }: { product: any }) {
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleClick = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full px-8 py-3 rounded-lg transition-colors ${
        added 
          ? 'bg-green-600 text-white' 
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  )
}

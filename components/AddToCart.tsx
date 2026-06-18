'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

export default function AddToCart({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0],
      quantity,
      slug: product.slug,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-gray-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button onClick={handleAdd} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
      <p className="text-xs text-gray-400">Free shipping on orders over $75</p>
    </div>
  );
}

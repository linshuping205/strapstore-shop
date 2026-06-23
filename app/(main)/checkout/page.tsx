'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch('/api/stripe/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleCheckout} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input required name="name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input required type="email" name="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <input required name="address" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input required name="city" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input required name="country" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Postal Code</label>
            <input required name="postalCode" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mt-8">
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <button type="submit" disabled={loading} className="btn-accent w-full">
            {loading ? 'Processing...' : `Pay $${total().toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { XCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={32} className="text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-500 mb-6">
            Your payment was cancelled. Your cart is still saved — you can try again whenever you are ready.
          </p>

          <div className="space-y-3">
            <Link
              href="/cart/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              <ShoppingBag size={18} />
              Return to Cart
            </Link>
            <Link
              href="/products/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-gray-600 bg-gray-50 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <ArrowRight size={18} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

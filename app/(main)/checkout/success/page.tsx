'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight, Mail } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/orders?sessionId=${sessionId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setOrder(data[0]);
          } else if (data && !Array.isArray(data)) {
            setOrder(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for your order. We will process it shortly and send a confirmation email.
          </p>

          {loading ? (
            <div className="text-sm text-gray-400 mb-6">Loading order details...</div>
          ) : order ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-sm font-mono font-medium text-gray-900 mb-3">{order.id}</p>
              <p className="text-sm text-gray-500 mb-1">Total</p>
              <p className="text-lg font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>
              {order.email && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <Mail size={14} />
                  Confirmation sent to {order.email}
                </div>
              )}
            </div>
          ) : sessionId ? (
            <p className="text-xs text-gray-400 mb-6 font-mono">
              Session: {sessionId.slice(0, 20)}...
            </p>
          ) : null}

          <div className="space-y-3">
            <Link
              href="/products/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-gray-600 bg-gray-50 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <ArrowRight size={18} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

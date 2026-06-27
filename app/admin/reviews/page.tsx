'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, RefreshCw, CheckCircle, XCircle, Trash2, Eye, Search,
  Filter, ArrowUpDown, MessageSquare
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface Review {
  id: string;
  productId: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-600', icon: ArrowUpDown },
  APPROVED: { label: 'Approved', color: 'bg-green-50 text-green-600', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-600', icon: XCircle },
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/reviews?${filter !== 'ALL' ? `status=${filter}&` : ''}limit=100`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete review:', e);
    }
  };

  const filtered = reviews.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.content.toLowerCase().includes(s) ||
      r.product.name.toLowerCase().includes(s)
    );
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'PENDING').length,
    approved: reviews.filter((r) => r.status === 'APPROVED').length,
    rejected: reviews.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-50' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700' },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl border border-gray-100 ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Content</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((review) => {
                  const StatusIcon = statusConfig[review.status].icon;
                  return (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/${review.product.slug}/`}
                          target="_blank"
                          className="text-amber-600 hover:text-amber-700 font-medium text-xs"
                        >
                          {review.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{review.name}</div>
                        <div className="text-xs text-gray-400">{review.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-gray-900 text-xs">{review.title || '-'}</div>
                        <div className="text-gray-500 text-xs truncate">{review.content}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[review.status].color}`}>
                          <StatusIcon size={12} />
                          {statusConfig[review.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDateShort(review.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {review.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateStatus(review.id, 'APPROVED')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => updateStatus(review.id, 'REJECTED')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/products/${review.product.slug}/`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            title="View Product"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

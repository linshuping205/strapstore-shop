'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface Review {
  id: string;
  name: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    content: '',
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
        setTotal(data.pagination?.total || 0);
        if (data.data && data.data.length > 0) {
          const avg = data.data.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.data.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
      }
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.email.trim() || !form.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Thank you! Your review has been submitted for approval.');
        setForm({ name: '', email: '', rating: 5, title: '', content: '' });
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  return (
    <div className="mt-16 pt-16 border-t border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm text-gray-500">
              {avgRating > 0 ? `${avgRating} out of 5` : 'No reviews yet'}
            </span>
            <span className="text-sm text-gray-400">({total} reviews)</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          <Send size={16} />
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-6 mb-10">
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: i }))}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      className={
                        i <= form.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">{form.rating}/5</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Summarize your experience"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                placeholder="Share your experience with this product..."
                required
                maxLength={2000}
              />
              <p className="text-xs text-gray-400 mt-1">{form.content.length}/2000</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-lg mb-2">No reviews yet</p>
          <p className="text-gray-400 text-sm">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <User size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
                      <span className="text-xs text-gray-400">{formatDateShort(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{review.title}</h4>
                  )}
                  <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

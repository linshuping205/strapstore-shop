'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  CreditCard,
  DollarSign,
  Clock,
  XCircle,
  CheckCircle,
  Package,
  Truck,
  Search,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PaymentItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface PaymentOrder {
  id: string;
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  total: number;
  status: string;
  stripeSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  items: PaymentItem[];
}

interface PaymentStats {
  totalRevenue: number;
  pendingRevenue: number;
  cancelledRevenue: number;
  totalOrders: number;
  paidCount: number;
  pendingCount: number;
  cancelledCount: number;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock, label: 'Pending' },
  PAID: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle, label: 'Paid' },
  SHIPPED: { color: 'bg-purple-50 text-purple-600 border-purple-100', icon: Truck, label: 'Shipped' },
  DELIVERED: { color: 'bg-green-50 text-green-600 border-green-100', icon: Package, label: 'Delivered' },
  CANCELLED: { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle, label: 'Cancelled' },
};

export default function PaymentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin-auth');
      const params = new URLSearchParams();
      if (filter !== 'All') params.set('status', filter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/payments?${params.toString()}`, {
        headers: { 'x-admin-auth': token || '' },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
        setStats(data.stats || null);
      } else {
        setError(data.error || 'Failed to load payments');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const token = localStorage.getItem('admin-auth');
    if (!token) {
      router.replace('/admin/');
      return;
    }
    fetchPayments();
  }, [fetchPayments, router]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const token = localStorage.getItem('admin-auth');
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': token || '',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
        // Refresh stats
        fetchPayments();
      }
    } catch (e) {
      console.error('Update error:', e);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        </div>
        <p className="text-gray-500">Track revenue, payment status, and manage order collections.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${formatPrice(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${formatPrice(stats.pendingRevenue)}</p>
                <p className="text-sm text-gray-500">Pending Collection</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${formatPrice(stats.cancelledRevenue)}</p>
                <p className="text-sm text-gray-500">Cancelled / Lost</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.paidCount}</p>
                <p className="text-sm text-gray-500">Paid Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPayments()}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="All">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={fetchPayments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p>No payment records found.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <>
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900 font-medium">{order.name}</p>
                          <p className="text-xs text-gray-500">{order.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">${formatPrice(order.total)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'PENDING' && (
                              <button
                                onClick={() => updateStatus(order.id, 'PAID')}
                                disabled={updating === order.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                {updating === order.id ? '...' : 'Mark Paid'}
                              </button>
                            )}
                            {order.status === 'PAID' && (
                              <button
                                onClick={() => updateStatus(order.id, 'SHIPPED')}
                                disabled={updating === order.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors disabled:opacity-50"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                {updating === order.id ? '...' : 'Ship'}
                              </button>
                            )}
                            {order.status === 'SHIPPED' && (
                              <button
                                onClick={() => updateStatus(order.id, 'DELIVERED')}
                                disabled={updating === order.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {updating === order.id ? '...' : 'Deliver'}
                              </button>
                            )}
                            {(order.status === 'PENDING' || order.status === 'PAID') && (
                              <button
                                onClick={() => updateStatus(order.id, 'CANCELLED')}
                                disabled={updating === order.id}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded === order.id && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 bg-gray-50/50">
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                                        {item.product.images?.[0] && (
                                          <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">
                                          Qty: {item.quantity} @ ${formatPrice(item.price)}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                      ${formatPrice(item.price * item.quantity)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                                <span className="text-sm text-gray-600">Total</span>
                                <span className="text-sm font-bold text-gray-900">${formatPrice(order.total)}</span>
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                <p><span className="font-medium">Address:</span> {order.address}, {order.city}, {order.country} {order.postalCode}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

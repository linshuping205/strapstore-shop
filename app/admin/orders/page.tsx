'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  name: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }[];
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: 'bg-amber-50 text-amber-600', icon: Package, label: 'Pending' },
  PAID: { color: 'bg-blue-50 text-blue-600', icon: Package, label: 'Paid' },
  SHIPPED: { color: 'bg-purple-50 text-purple-600', icon: Truck, label: 'Shipped' },
  DELIVERED: { color: 'bg-green-50 text-green-600', icon: CheckCircle, label: 'Delivered' },
  CANCELLED: { color: 'bg-red-50 text-red-600', icon: XCircle, label: 'Cancelled' },
};

const statusFlow = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const nextStatus = (current: string): string => {
    const idx = statusFlow.indexOf(current);
    if (idx === -1 || idx >= statusFlow.length - 1) return current;
    return statusFlow[idx + 1];
  };

  const updateStatus = async (id: string, current: string) => {
    const newStatus = nextStatus(current);
    if (newStatus === current) return;

    setUpdating(id);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const formatPrice = (price: any) => {
    const num = Number(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option>All</option>
          <option>PENDING</option>
          <option>PAID</option>
          <option>SHIPPED</option>
          <option>DELIVERED</option>
          <option>CANCELLED</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <>
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium">{order.name}</p>
                          <p className="text-xs text-gray-500">{order.email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          ${formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}
                          >
                            <StatusIcon size={14} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => updateStatus(order.id, order.status)}
                                disabled={updating === order.id}
                                className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors disabled:opacity-50"
                              >
                                {updating === order.id ? 'Updating...' : 'Update'}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setExpanded(expanded === order.id ? null : order.id)
                              }
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded === order.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50/50">
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Order Items
                              </h4>
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
                                        <p className="text-sm font-medium text-gray-900">
                                          {item.product.name}
                                        </p>
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
                                <span className="text-sm font-bold text-gray-900">
                                  ${formatPrice(order.total)}
                                </span>
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

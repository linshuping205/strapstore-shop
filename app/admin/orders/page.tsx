'use client';

import { useState } from 'react';
import { Search, Eye, Package, Truck, CheckCircle } from 'lucide-react';

interface OrderItem {
  name: string;
  qty: number;
  price: string;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  total: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  date: string;
  items: OrderItem[];
}

const initialOrders: Order[] = [
  {
    id: '#ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    total: '$89.00',
    status: 'Delivered',
    date: '2026-06-22',
    items: [{ name: 'Leather Strap - Brown', qty: 1, price: '$45.00' }, { name: 'NATO Strap - Navy', qty: 2, price: '$22.00' }],
  },
  {
    id: '#ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    total: '$156.00',
    status: 'Shipped',
    date: '2026-06-21',
    items: [{ name: 'Metal Link Bracelet - Silver', qty: 1, price: '$89.00' }, { name: 'Silicone Band - Black', qty: 2, price: '$33.50' }],
  },
  {
    id: '#ORD-003',
    customer: 'Mike Brown',
    email: 'mike@example.com',
    total: '$45.00',
    status: 'Processing',
    date: '2026-06-20',
    items: [{ name: 'Leather Strap - Black', qty: 1, price: '$45.00' }],
  },
  {
    id: '#ORD-004',
    customer: 'Sarah Lee',
    email: 'sarah@example.com',
    total: '$234.00',
    status: 'Pending',
    date: '2026-06-19',
    items: [{ name: 'Metal Link - Gold', qty: 2, price: '$117.00' }],
  },
];

const statusConfig = {
  Pending: { color: 'bg-amber-50 text-amber-600', icon: Package },
  Processing: { color: 'bg-blue-50 text-blue-600', icon: Package },
  Shipped: { color: 'bg-purple-50 text-purple-600', icon: Truck },
  Delivered: { color: 'bg-green-50 text-green-600', icon: CheckCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const nextStatus = (current: Order['status']): Order['status'] => {
    const flow: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const idx = flow.indexOf(current);
    return flow[Math.min(idx + 1, flow.length - 1)];
  };

  const updateStatus = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus(o.status) } : o))
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
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
              {filtered.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-medium">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{order.total}</td>
                      <td className="px-6 py-4 text-gray-600">{order.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon size={14} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateStatus(order.id)}
                            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
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
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">{item.price}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                              <span className="text-sm text-gray-600">Total</span>
                              <span className="text-sm font-bold text-gray-900">{order.total}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

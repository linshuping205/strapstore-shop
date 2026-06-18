'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  email: string;
  name: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const password = prompt('Enter admin password');
    fetch('/api/orders/', { headers: { 'x-admin-password': password || '' } })
      .then((res) => res.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Orders</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{order.name}<br/><span className="text-gray-400">{order.email}</span></td>
                <td className="px-4 py-3 font-medium">${Number(order.total).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

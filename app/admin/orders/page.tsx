"use client";

import { useState } from "react";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled" | "Refunded";
  payment: "Stripe" | "PayPal" | "COD";
  date: string;
  shipping: { address: string; city: string; country: string; zip: string };
}

const initialOrders: Order[] = [
  { id: "ORD-2024-001", customer: "John Smith", email: "john@example.com", items: [{ name: "Premium Leather Strap - Brown", qty: 1, price: 49.00 }, { name: "NATO Nylon Strap - Navy", qty: 2, price: 29.00 }], total: 107.00, status: "Completed", payment: "Stripe", date: "2024-06-20", shipping: { address: "123 Main St", city: "Los Angeles", country: "USA", zip: "90001" } },
  { id: "ORD-2024-002", customer: "Emma Wilson", email: "emma@example.com", items: [{ name: "Metal Link Bracelet - Silver", qty: 1, price: 89.00 }], total: 89.00, status: "Shipped", payment: "PayPal", date: "2024-06-19", shipping: { address: "456 Oak Ave", city: "New York", country: "USA", zip: "10001" } },
  { id: "ORD-2024-003", customer: "Michael Brown", email: "michael@example.com", items: [{ name: "Rubber Sport Strap - Black", qty: 1, price: 35.00 }, { name: "Vintage Leather Strap - Tan", qty: 1, price: 59.00 }], total: 94.00, status: "Processing", payment: "Stripe", date: "2024-06-18", shipping: { address: "789 Pine Rd", city: "Chicago", country: "USA", zip: "60601" } },
  { id: "ORD-2024-004", customer: "Sarah Davis", email: "sarah@example.com", items: [{ name: "Silicone Dive Strap - Orange", qty: 3, price: 25.00 }], total: 75.00, status: "Pending", payment: "COD", date: "2024-06-18", shipping: { address: "321 Elm St", city: "Houston", country: "USA", zip: "77001" } },
  { id: "ORD-2024-005", customer: "James Miller", email: "james@example.com", items: [{ name: "Premium Leather Strap - Brown", qty: 2, price: 49.00 }], total: 98.00, status: "Completed", payment: "Stripe", date: "2024-06-17", shipping: { address: "654 Maple Dr", city: "Miami", country: "USA", zip: "33101" } },
  { id: "ORD-2024-006", customer: "Lisa Anderson", email: "lisa@example.com", items: [{ name: "NATO Nylon Strap - Navy", qty: 1, price: 29.00 }], total: 29.00, status: "Cancelled", payment: "PayPal", date: "2024-06-16", shipping: { address: "987 Cedar Ln", city: "Seattle", country: "USA", zip: "98101" } },
];

const statusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Processing: "bg-amber-50 text-amber-700",
  Shipped: "bg-sky-50 text-sky-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-700",
  Refunded: "bg-purple-50 text-purple-700",
};

const statusOptions = ["Pending", "Processing", "Shipped", "Completed", "Cancelled", "Refunded"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
  };

  const detailOrder = orders.find(o => o.id === detailId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
          <p className="text-sm text-gray-400 mt-1">Manage customer orders and fulfillment</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-gray-800">{orders.length}</span> orders | Revenue: <span className="font-semibold text-gray-800">${orders.filter(o => o.status === "Completed").reduce((s, o) => s + o.total, 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by ID, customer or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
          <option value="All">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {detailId && detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setDetailId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Order {detailOrder.id}</h3>
              <button onClick={() => setDetailId(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[detailOrder.status]}`}>{detailOrder.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Date</div>
                  <div className="text-sm font-medium text-gray-800">{detailOrder.date}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Customer</div>
                <div className="text-sm font-medium text-gray-800">{detailOrder.customer}</div>
                <div className="text-sm text-gray-500">{detailOrder.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Shipping Address</div>
                <div className="text-sm text-gray-700">{detailOrder.shipping.address}<br/>{detailOrder.shipping.city}, {detailOrder.shipping.country} {detailOrder.shipping.zip}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Items</div>
                <div className="space-y-2">
                  {detailOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50">
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">x{item.qty}</span></span>
                      <span className="font-medium text-gray-800">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm text-gray-400">Payment: {detailOrder.payment}</span>
                <span className="text-lg font-bold text-gray-800">${detailOrder.total.toFixed(2)}</span>
              </div>
              <div className="pt-2">
                <div className="text-sm text-gray-400 mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button key={s} onClick={() => updateStatus(detailOrder.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${detailOrder.status === s ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => setDetailId(order.id)}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{order.customer}</div>
                      <div className="text-xs text-gray-400">{order.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} item(s)</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.payment}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); setDetailId(order.id); }} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No orders found.</div>}
      </div>
    </div>
  );
}

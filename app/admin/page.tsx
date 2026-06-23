"use client";

const stats = [
  { label: "Total Products", value: 128, change: "+12", color: "bg-amber-500" },
  { label: "Total Orders", value: 456, change: "+28", color: "bg-emerald-500" },
  { label: "Blog Posts", value: 34, change: "+5", color: "bg-sky-500" },
  { label: "Revenue", value: "$12,450", change: "+8.2%", color: "bg-rose-500" },
];

const recentOrders = [
  { id: "#ORD-001", customer: "John Smith", product: "Leather Watch Strap - Brown", amount: "$49.00", status: "Completed" },
  { id: "#ORD-002", customer: "Emma Wilson", product: "NATO Strap - Navy Blue", amount: "$29.00", status: "Processing" },
  { id: "#ORD-003", customer: "Michael Brown", product: "Metal Link Bracelet - Silver", amount: "$89.00", status: "Shipped" },
  { id: "#ORD-004", customer: "Sarah Davis", product: "Rubber Sport Strap - Black", amount: "$35.00", status: "Pending" },
  { id: "#ORD-005", customer: "James Miller", product: "Vintage Leather Strap", amount: "$59.00", status: "Completed" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <button className="text-sm text-amber-600 font-medium hover:text-amber-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.product}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                      order.status === "Processing" ? "bg-amber-50 text-amber-700" :
                      order.status === "Shipped" ? "bg-sky-50 text-sky-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

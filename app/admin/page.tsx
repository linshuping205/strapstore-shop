'use client';

import { Package, FileText, ShoppingCart, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Products', value: '128', icon: Package, change: '+12%' },
  { label: 'Total Orders', value: '86', icon: ShoppingCart, change: '+8%' },
  { label: 'Blog Posts', value: '24', icon: FileText, change: '+3%' },
  { label: 'Revenue', value: '$12,450', icon: TrendingUp, change: '+18%' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <stat.icon size={22} className="text-amber-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {[
              { id: '#ORD-001', customer: 'John Doe', amount: '$89.00', status: 'Completed' },
              { id: '#ORD-002', customer: 'Jane Smith', amount: '$156.00', status: 'Processing' },
              { id: '#ORD-003', customer: 'Mike Brown', amount: '$45.00', status: 'Pending' },
              { id: '#ORD-004', customer: 'Sarah Lee', amount: '$234.00', status: 'Completed' },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-50 text-green-600' :
                    order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Add Product', 'New Blog Post', 'View Orders', 'Settings'].map((action) => (
              <button
                key={action}
                className="p-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

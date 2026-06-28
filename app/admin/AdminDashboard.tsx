'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, FileText, ShoppingCart, Heart, Eye, MessageCircle
} from 'lucide-react';
import { Order, Post } from '@/types';

interface DashboardStats {
  label: string;
  value: string;
  icon: React.ElementType;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats[]>([
    { label: 'Total Products', value: '0', icon: Package },
    { label: 'Total Orders', value: '0', icon: ShoppingCart },
    { label: 'Blog Posts', value: '0', icon: FileText },
    { label: 'Total Likes', value: '0', icon: Heart },
    { label: 'Total Views', value: '0', icon: Eye },
    { label: 'Total Comments', value: '0', icon: MessageCircle },
  ]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, ordersRes, postsRes] = await Promise.all([
          fetch('/api/products').then(r => r.ok ? r.json() : []),
          fetch('/api/orders').then(r => r.ok ? r.json() : []),
          fetch('/api/admin/posts').then(r => r.ok ? r.json() : []),
        ]);

        const posts = Array.isArray(postsRes) ? postsRes : [];
        const totalLikes = posts.reduce((sum: number, p: Post) => sum + (p.likes || 0), 0);
        const totalViews = posts.reduce((sum: number, p: Post) => sum + (p.views || 0), 0);
        const totalComments = posts.reduce((sum: number, p: Post) => sum + (p._count?.comments || 0), 0);

        const orders = Array.isArray(ordersRes) ? ordersRes : [];
        setRecentOrders(orders.slice(0, 5));

        setStats([
          { label: 'Total Products', value: String(productsRes.length || 0), icon: Package },
          { label: 'Total Orders', value: String(orders.length || 0), icon: ShoppingCart },
          { label: 'Blog Posts', value: String(posts.length || 0), icon: FileText },
          { label: 'Total Likes', value: String(totalLikes), icon: Heart },
          { label: 'Total Views', value: String(totalViews), icon: Eye },
          { label: 'Total Comments', value: String(totalComments), icon: MessageCircle },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <stat.icon size={22} className="text-amber-600" />
              </div>
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
            {recentOrders.length > 0 ? (
              recentOrders.map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.id.slice(-6)}</p>
                    <p className="text-xs text-gray-500">{order.name || order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${Number(order.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'PAID' || order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4">No orders yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/products/edit/new/" className="p-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all text-center">
              Add Product
            </Link>
            <Link href="/admin/blogs/edit/new/" className="p-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all text-center">
              New Blog Post
            </Link>
            <Link href="/admin/orders/" className="p-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all text-center">
              View Orders
            </Link>
            <Link href="/admin/settings/" className="p-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all text-center">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

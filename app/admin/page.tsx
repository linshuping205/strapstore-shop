'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, User, Lock, ArrowRight, AlertCircle,
  Package, FileText, ShoppingCart, TrendingUp, Heart, Eye, MessageCircle
} from 'lucide-react';
import { Order, Post } from '@/types';
import { formatPrice } from '@/lib/utils';

interface DashboardStats {
  label: string;
  value: string;
  icon: React.ElementType;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<DashboardStats[]>([
    { label: 'Total Products', value: '0', icon: Package },
    { label: 'Total Orders', value: '0', icon: ShoppingCart },
    { label: 'Blog Posts', value: '0', icon: FileText },
    { label: 'Total Likes', value: '0', icon: Heart },
    { label: 'Total Views', value: '0', icon: Eye },
    { label: 'Total Comments', value: '0', icon: MessageCircle },
  ]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const checkAuth = () => {
      const hasCookie = document.cookie.includes('admin-auth=');
      setIsLoggedIn(hasCookie);
      setChecking(false);
    };
    checkAuth();
  }, []);

  // Fetch dashboard data when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

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
        setDashboardLoading(false);
      }
    }

    fetchStats();
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      setIsLoggedIn(true);
      setDashboardLoading(true);
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-sm text-gray-500 mt-1">MasterStrap Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Default: admin / admin123
          </p>
        </div>
      </div>
    );
  }

  // Dashboard
  if (dashboardLoading) {
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

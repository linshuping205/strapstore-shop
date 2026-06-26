'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Pencil, Trash2, Eye, RefreshCw, Package } from 'lucide-react';
import type { Product } from '@/types/blog';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const generateSampleProducts = async () => {
    if (!confirm('Create 4 sample products?')) return;
    setLoading(true);
    const ts = Date.now();
    const samples = [
      {
        name: 'Italian Buttero Leather Strap',
        slug: `italian-buttero-${ts}-1`,
        description: 'Handcrafted from premium Italian vegetable-tanned leather.',
        price: '89.00',
        comparePrice: '129.00',
        images: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=600&fit=crop',
        category: 'Leather',
        material: 'Vegetable-Tanned Leather',
        stock: '50',
        sku: `IBL-${ts}-1`,
        isActive: true,
      },
      {
        name: 'Crocodile Embossed Calfskin Strap',
        slug: `crocodile-embossed-${ts}-2`,
        description: 'Luxurious crocodile pattern embossed on premium calfskin.',
        price: '99.00',
        comparePrice: '',
        images: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
        category: 'Exotic',
        material: 'Calfskin',
        stock: '30',
        sku: `CEC-${ts}-2`,
        isActive: true,
      },
      {
        name: 'Aerospace Fluoroelastomer Sport Strap',
        slug: `aerospace-fluoroelastomer-${ts}-3`,
        description: 'High-performance fluoroelastomer rubber strap for dive watches.',
        price: '59.00',
        comparePrice: '79.00',
        images: 'https://images.unsplash.com/photo-1434056886845-dbe89f8f1db8?w=600&h=600&fit=crop',
        category: 'Rubber',
        material: 'Fluoroelastomer',
        stock: '100',
        sku: `AFS-${ts}-3`,
        isActive: true,
      },
      {
        name: 'High-Density Woven Nylon Strap',
        slug: `high-density-nylon-${ts}-4`,
        description: 'Military-grade ballistic nylon with stainless steel hardware.',
        price: '45.00',
        comparePrice: '',
        images: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop',
        category: 'Nylon',
        material: 'Ballistic Nylon',
        stock: '200',
        sku: `HDN-${ts}-4`,
        isActive: true,
      },
    ];

    let created = 0;
    for (const product of samples) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        if (res.ok) created++;
      } catch {
        // ignore
      }
    }

    alert(`Created ${created} sample products`);
    await loadProducts();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const formatPrice = (price: any) => {
    const num = Number(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={generateSampleProducts}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Plus size={18} />
            Generate Samples
          </button>
          <Link
            href="/admin/products/edit/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">${formatPrice(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-400 line-through">${formatPrice(product.comparePrice)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      product.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={16} />
                      </a>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products found
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

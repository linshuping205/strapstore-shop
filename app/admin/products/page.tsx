'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Eye, RefreshCw } from 'lucide-react';
import type { Product, ProductForm } from '@/types/blog';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [activeStep, setActiveStep] = useState('basic');

  const [form, setForm] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    images: '',
    category: 'Leather',
    material: '',
    stock: '',
    sku: '',
    isActive: true,
    metaTitle: '',
    metaDesc: '',
  });

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

  const openAdd = () => {
    setEditing(null);
    setActiveStep('basic');
    setForm({
      name: '', slug: '', description: '', price: '', comparePrice: '',
      images: '', category: 'Leather', material: '', stock: '', sku: '',
      isActive: true, metaTitle: '', metaDesc: '',
    });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setActiveStep('basic');
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: String(product.price || ''),
      comparePrice: String(product.comparePrice || ''),
      images: product.images?.join(', ') || '',
      category: product.category,
      material: product.material || '',
      stock: String(product.stock || ''),
      sku: product.sku || '',
      isActive: product.isActive,
      metaTitle: product.metaTitle || '',
      metaDesc: product.metaDesc || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.price) return;

    const payload = {
      ...form,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
    };

    const url = editing ? `/api/products/${editing.id}` : '/api/products';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const saved = await res.json();
      if (editing) {
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? saved : p)));
      } else {
        setProducts((prev) => [saved, ...prev]);
      }
      setShowModal(false);
    } else {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);

  const formatPrice = (price: any) => {
    const num = Number(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div>
      {loading && (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      )}

      {!loading && (
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
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                <Plus size={18} />
                Add Product
              </button>
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
                              <span className="text-gray-300 text-xs">No img</span>
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
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                          >
                            <Pencil size={16} />
                          </button>
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
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center py-10 px-4">
            <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editing ? 'Edit Product' : 'New Product'}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {editing ? 'Modify existing product info' : 'Fill product details to publish'}
                  </span>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="flex min-h-[600px]">
                {/* Left sidebar - steps */}
                <div className="w-48 bg-gray-50 border-r border-gray-100 py-4 flex-shrink-0">
                  {[
                    { id: 'basic', label: 'Basic Info', desc: 'Name, category, SKU' },
                    { id: 'sales', label: 'Sales Info', desc: 'Price, stock, status' },
                    { id: 'media', label: 'Media & Desc', desc: 'Images, description' },
                  ].map((step, i) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                        activeStep === step.id ? 'bg-white border-l-3 border-amber-500' : 'hover:bg-white/50'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                        activeStep === step.id
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <div className={`text-sm font-medium ${activeStep === step.id ? 'text-gray-900' : 'text-gray-600'}`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{step.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right content */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
                  {/* Step 1: Basic Info */}
                  {activeStep === 'basic' && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-100">
                        <h4 className="font-medium text-gray-900">Basic Information</h4>
                        <p className="text-xs text-gray-400 mt-1">Product name, category, and identification</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => {
                              const t = e.target.value;
                              setForm((p) => ({
                                ...p,
                                name: t,
                                slug: editing ? p.slug : autoSlug(t),
                              }));
                            }}
                            placeholder="Enter product name"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-400 mt-1">Name will be displayed on storefront and search results</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                          <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                          <input
                            type="text"
                            value={form.sku}
                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                            placeholder="e.g. STRAP-001"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                          >
                            <option>Leather</option>
                            <option>Exotic</option>
                            <option>Rubber</option>
                            <option>Nylon</option>
                            <option>Metal</option>
                            <option>Silicone</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                          <input
                            type="text"
                            value={form.material}
                            onChange={(e) => setForm({ ...form, material: e.target.value })}
                            placeholder="e.g. Italian Vegetable-Tanned Leather"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Sales Info */}
                  {activeStep === 'sales' && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-100">
                        <h4 className="font-medium text-gray-900">Sales Information</h4>
                        <p className="text-xs text-gray-400 mt-1">Pricing, inventory, and availability</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            placeholder="0.00"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={form.comparePrice}
                            onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                            placeholder="Original price for discount display"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            placeholder="0"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <div>
                          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Active / Visible on storefront
                          </label>
                          <p className="text-xs text-gray-400 mt-0.5">When checked, product will be visible to customers</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Media & Description */}
                  {activeStep === 'media' && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-100">
                        <h4 className="font-medium text-gray-900">Product Images</h4>
                        <p className="text-xs text-gray-400 mt-1">Upload product images (first image will be used as main image)</p>
                      </div>

                      {/* Image upload area */}
                      <div>
                        <div className="flex flex-wrap gap-3 mb-4">
                          {form.images && form.images.split(',').map((url, i) => {
                            const trimmed = url.trim();
                            if (!trimmed) return null;
                            return (
                              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group flex-shrink-0">
                                <img src={trimmed} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                                <button
                                  onClick={() => {
                                    const urls = form.images.split(',').filter((_, idx) => idx !== i);
                                    setForm({ ...form, images: urls.join(',') });
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                  <X size={12} />
                                </button>
                                {i === 0 && (
                                  <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                    Main
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors flex-shrink-0">
                            <Plus size={20} className="text-gray-400" />
                            <span className="text-xs text-gray-400">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files) return;
                                const uploadedUrls: string[] = [];
                                for (const file of Array.from(files)) {
                                  if (file.size > 4 * 1024 * 1024) {
                                    alert(`${file.name} exceeds 4MB limit`);
                                    continue;
                                  }
                                  try {
                                    const filename = `products/${Date.now()}_${file.name}`;
                                    const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                                      method: 'POST',
                                      body: file,
                                    });
                                    if (res.ok) {
                                      const { url } = await res.json();
                                      uploadedUrls.push(url);
                                    } else {
                                      alert(`Failed to upload ${file.name}`);
                                    }
                                  } catch {
                                    alert(`Upload error: ${file.name}`);
                                  }
                                }
                                if (uploadedUrls.length > 0) {
                                  const current = form.images ? form.images.split(',').filter(Boolean) : [];
                                  setForm({ ...form, images: [...current, ...uploadedUrls].join(', ') });
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-400">Click + to upload images, drag to reorder (support: jpg, png, webp, max 4MB each)</p>
                      </div>

                      <div className="pb-4 border-b border-gray-100">
                        <h4 className="font-medium text-gray-900">Product Description</h4>
                        <p className="text-xs text-gray-400 mt-1">Detailed description shown on product page</p>
                      </div>

                      <div>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          rows={6}
                          placeholder="Describe your product features, materials, usage scenarios..."
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                          <input
                            type="text"
                            value={form.metaTitle}
                            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                            placeholder="Optional - for search engines"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                          <input
                            type="text"
                            value={form.metaDesc}
                            onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
                            placeholder="Optional - for search engines"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  {activeStep !== 'basic' && (
                    <button
                      onClick={() => {
                        if (activeStep === 'sales') setActiveStep('basic');
                        if (activeStep === 'media') setActiveStep('sales');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  {activeStep !== 'media' ? (
                    <button
                      onClick={() => {
                        if (activeStep === 'basic') setActiveStep('sales');
                        if (activeStep === 'sales') setActiveStep('media');
                      }}
                      className="px-6 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                    >
                      {editing ? 'Save Changes' : 'Publish Product'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

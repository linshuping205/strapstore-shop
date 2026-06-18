'use client';

import { useState } from 'react';

export default function AdminProducts() {
  const [form, setForm] = useState({
    slug: '', name: '', description: '', price: '', comparePrice: '',
    images: '', category: '', material: '', sku: '', stock: '',
    metaTitle: '', metaDesc: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = prompt('Enter admin password');
    const res = await fetch('/api/products/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password || '',
      },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        images: form.images.split(',').map((s) => s.trim()),
        tags: [],
        stock: parseInt(form.stock),
      }),
    });
    if (res.ok) {
      alert('Product created!');
      setForm({ slug: '', name: '', description: '', price: '', comparePrice: '', images: '', category: '', material: '', sku: '', stock: '', metaTitle: '', metaDesc: '' });
    } else {
      alert('Error creating product');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input placeholder="Slug (URL)" className="w-full border p-3 rounded" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} required />
        <input placeholder="Product Name" className="w-full border p-3 rounded" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        <textarea placeholder="Description" className="w-full border p-3 rounded h-32" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required />
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Price" type="number" step="0.01" className="w-full border p-3 rounded" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
          <input placeholder="Compare Price" type="number" step="0.01" className="w-full border p-3 rounded" value={form.comparePrice} onChange={(e) => setForm({...form, comparePrice: e.target.value})} />
        </div>
        <input placeholder="Images (comma separated URLs)" className="w-full border p-3 rounded" value={form.images} onChange={(e) => setForm({...form, images: e.target.value})} required />
        <div className="grid grid-cols-3 gap-4">
          <input placeholder="Category" className="w-full border p-3 rounded" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} required />
          <input placeholder="Material" className="w-full border p-3 rounded" value={form.material} onChange={(e) => setForm({...form, material: e.target.value})} required />
          <input placeholder="SKU" className="w-full border p-3 rounded" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} required />
        </div>
        <input placeholder="Stock" type="number" className="w-full border p-3 rounded" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} required />
        <input placeholder="Meta Title (SEO)" className="w-full border p-3 rounded" value={form.metaTitle} onChange={(e) => setForm({...form, metaTitle: e.target.value})} />
        <input placeholder="Meta Description (SEO)" className="w-full border p-3 rounded" value={form.metaDesc} onChange={(e) => setForm({...form, metaDesc: e.target.value})} />
        <button type="submit" className="btn-primary w-full">Create Product</button>
      </form>
    </div>
  );
}

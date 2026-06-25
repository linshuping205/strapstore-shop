'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, X, Eye, RefreshCw, ImageIcon, Upload } from 'lucide-react';
import type { Product, ProductForm } from '@/types/blog';
import RichTextEditor from '@/components/blog/RichTextEditor';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

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
      console.log('GET /api/products response:', data);
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('API returned non-array:', data);
        alert('Failed to load products: ' + (data.error || JSON.stringify(data)));
        setProducts([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      alert('Network error: ' + err.message);
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
    const sampleProducts = [
      {
        name: 'Italian Buttero Vegetable-Tanned Leather Strap',
        slug: `italian-buttero-leather-strap-${ts}-1`,
        description: 'Handcrafted from premium Italian vegetable-tanned leather. Features a rich, natural patina that develops over time.',
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
        slug: `crocodile-embossed-calfskin-${ts}-2`,
        description: 'Luxurious crocodile pattern embossed on premium calfskin. Water-resistant and durable.',
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
        slug: `aerospace-fluoroelastomer-sport-${ts}-3`,
        description: 'High-performance fluoroelastomer rubber strap designed for extreme conditions. Perfect for dive watches.',
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
        slug: `high-density-woven-nylon-${ts}-4`,
        description: 'Military-grade ballistic nylon with stainless steel hardware. Lightweight and breathable.',
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
    let failed = 0;
    const errors: string[] = [];
    for (const product of sampleProducts) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        if (res.ok) {
          created++;
        } else {
          const err = await res.json().catch(() => ({}));
          failed++;
          errors.push(`${product.name}: ${err.error || res.statusText}`);
        }
      } catch (e: any) {
        failed++;
        errors.push(`${product.name}: ${e.message}`);
      }
    }

    if (failed > 0) {
      alert(`Created ${created} / ${sampleProducts.length} products.\nFailed:\n${errors.join('\n')}`);
    } else {
      alert(`Created ${created} sample products successfully!`);
    }

    await loadProducts();
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '', slug: '', description: '', price: '', comparePrice: '',
      images: '', category: 'Leather', material: '', stock: '', sku: '',
      isActive: true, metaTitle: '', metaDesc: '',
    });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
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
      const err = await res.json().catch(() => ({}));
      alert('Save failed: ' + (err.error || res.statusText));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Delete failed');
    }
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);

  const formatPrice = (price: any) => {
    const num = Number(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  if (loading) return null;

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
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={generateSampleProducts}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Plus size={18} /> Generate Samples
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Plus size={18} /> Add Product
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
                          <ImageIcon size={16} className="text-gray-300" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
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
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <RichTextEditor
                  initialContent={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.comparePrice}
                    onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
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
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    placeholder="e.g. Vegetable-Tanned Leather"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Unique stock keeping unit"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="space-y-3">
                  {/* Image previews */}
                  {form.images && (
                    <div className="flex flex-wrap gap-2">
                      {form.images.split(',').map((url, i) => {
                        const trimmed = url.trim();
                        if (!trimmed) return null;
                        return (
                          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={trimmed} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                const urls = form.images.split(',').filter((_, idx) => idx !== i);
                                setForm({ ...form, images: urls.join(',') });
                              }}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Upload button + URL input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="product-image-upload"
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
                          } catch (err) {
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
                    <label
                      htmlFor="product-image-upload"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      <Upload size={16} /> Upload Images
                    </label>
                    <span className="text-xs text-gray-400">or paste URLs below</span>
                  </div>
                  
                  <input
                    type="text"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="https://..., https://..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-gray-400">Comma separated URLs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible on storefront)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                  <input
                    type="text"
                    value={form.metaDesc}
                    onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                {editing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

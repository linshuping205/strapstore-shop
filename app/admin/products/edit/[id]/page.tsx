'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Trash2, Plus, X, ImageIcon, CheckCircle, Upload, Eye, Loader2
} from 'lucide-react';

const STEPS = [
  { id: 'basic', label: 'Basic Info', desc: 'Name, category, identification' },
  { id: 'sales', label: 'Sales Info', desc: 'Price, inventory, status' },
  { id: 'media', label: 'Media & Desc', desc: 'Images, description, SEO' },
];

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string | undefined;
  const isNew = !productId || productId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    category: 'Leather',
    material: '',
    isActive: true,
    metaTitle: '',
    metaDesc: '',
  });

  // Load product data for editing
  const loadProduct = useCallback(async () => {
    if (isNew) return;
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const product = await res.json();
        setForm({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          price: String(product.price || ''),
          comparePrice: String(product.comparePrice || ''),
          stock: String(product.stock || ''),
          sku: product.sku || '',
          category: product.category || 'Leather',
          material: product.material || '',
          isActive: product.isActive !== false,
          metaTitle: product.metaTitle || '',
          metaDesc: product.metaDesc || '',
        });
        setImages(product.images || []);
      }
    } catch (e) {
      console.error('Failed to load product:', e);
    } finally {
      setLoading(false);
    }
  }, [productId, isNew]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price is required';
    if (!form.stock || Number(form.stock) < 0) errs.stock = 'Stock quantity is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      // Jump to first error step
      if (errors.name || errors.slug) setActiveStep('basic');
      else if (errors.price || errors.stock) setActiveStep('sales');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock),
      images,
    };

    const url = isNew ? '/api/products' : `/api/products/${productId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        alert(isNew ? 'Product created successfully!' : 'Product saved successfully!');
        if (isNew) {
          router.push(`/admin/products/edit/${saved.id}`);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Save failed: ' + (err.error || res.statusText));
      }
    } catch (e: any) {
      alert('Network error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Product deleted');
        router.push('/admin/products');
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Delete failed');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
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
          headers: {
            'x-admin-auth': 'admin-secret-token-2024',
          },
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
      setImages((prev) => [...prev, ...uploadedUrls]);
    }
    setUploading(false);
    e.target.value = '';
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);
    setImages(newImages);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Products
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">
              {isNew ? 'Publish New Product' : 'Edit Product'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <Link
              href={!isNew ? `/products/${form.slug}` : '#'}
              target={!isNew ? '_blank' : undefined}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isNew
                  ? 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                  : 'text-gray-300 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <Eye size={16} />
              Preview
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left sidebar - steps */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-20">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-medium text-gray-900">Publish Steps</h2>
                <p className="text-xs text-gray-400 mt-1">Complete all required fields</p>
              </div>
              <div className="p-2">
                {STEPS.map((step, i) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left px-3 py-3 flex items-start gap-3 rounded-lg transition-colors ${
                      activeStep === step.id
                        ? 'bg-amber-50 border-l-2 border-amber-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                        activeStep === step.id
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          activeStep === step.id ? 'text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{step.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              {/* Step 1: Basic Info */}
              {activeStep === 'basic' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Product name, category, and identification details
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            name: val,
                            slug: isNew ? autoSlug(val) : p.slug,
                          }));
                          if (errors.name) setErrors((e) => ({ ...e, name: '' }));
                        }}
                        placeholder="Enter product name"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                          errors.name
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                            : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Name will be displayed on storefront and search results
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, slug: e.target.value }));
                            if (errors.slug) setErrors((e) => ({ ...e, slug: '' }));
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.slug
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                          }`}
                        />
                        {errors.slug && (
                          <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
                        <input
                          type="text"
                          value={form.sku}
                          onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                          placeholder="e.g. STRAP-001"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 bg-white"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Material</label>
                        <input
                          type="text"
                          value={form.material}
                          onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))}
                          placeholder="e.g. Italian Vegetable-Tanned Leather"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveStep('sales')}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                    >
                      Next: Sales Info →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Sales Info */}
              {activeStep === 'sales' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Sales Information</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Pricing, inventory, and availability settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => {
                              setForm((p) => ({ ...p, price: e.target.value }));
                              if (errors.price) setErrors((e) => ({ ...e, price: '' }));
                            }}
                            placeholder="0.00"
                            className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                              errors.price
                                ? 'border-red-300 focus:ring-red-200'
                                : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                            }`}
                          />
                        </div>
                        {errors.price && (
                          <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Compare Price ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={form.comparePrice}
                            onChange={(e) => setForm((p) => ({ ...p, comparePrice: e.target.value }))}
                            placeholder="Original price"
                            className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Shown as strikethrough to show discount</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={form.stock}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, stock: e.target.value }));
                            if (errors.stock) setErrors((e) => ({ ...e, stock: '' }));
                          }}
                          placeholder="0"
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.stock
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                          }`}
                        />
                        {errors.stock && (
                          <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={form.isActive}
                          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                          className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <div>
                          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Active / Visible on storefront
                          </label>
                          <p className="text-xs text-gray-400 mt-0.5">
                            When checked, customers can see and purchase this product
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setActiveStep('basic')}
                      className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActiveStep('media')}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                    >
                      Next: Media & Desc →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Media & Description */}
              {activeStep === 'media' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Upload images (first image will be the main product image)
                    </p>
                  </div>

                  {/* Image upload area */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {images.map((url, i) => (
                        <div
                          key={i}
                          className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 group bg-gray-50 flex-shrink-0"
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex items-center gap-1">
                              {i > 0 && (
                                <button
                                  onClick={() => setMainImage(i)}
                                  className="p-1.5 bg-white rounded-full text-amber-600 hover:bg-amber-50"
                                  title="Set as main image"
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => moveImage(i, i - 1)}
                                className="p-1.5 bg-white rounded-full text-gray-600 hover:bg-gray-50"
                                title="Move left"
                              >
                                ←
                              </button>
                              <button
                                onClick={() => moveImage(i, i + 1)}
                                className="p-1.5 bg-white rounded-full text-gray-600 hover:bg-gray-50"
                                title="Move right"
                              >
                                →
                              </button>
                              <button
                                onClick={() => removeImage(i)}
                                className="p-1.5 bg-white rounded-full text-red-500 hover:bg-red-50"
                                title="Delete"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                              Main Image
                            </span>
                          )}
                          <span className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                            {i + 1}
                          </span>
                        </div>
                      ))}

                      <label className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors flex-shrink-0">
                        {uploading ? (
                          <Loader2 size={20} className="text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <Upload size={20} className="text-gray-400" />
                            <span className="text-xs text-gray-400">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-400">
                      Support: JPG, PNG, WEBP, max 4MB per image. First image is the main product image.
                    </p>
                  </div>

                  <div className="border-b border-gray-100 pb-4 pt-2">
                    <h3 className="text-lg font-medium text-gray-900">Product Description</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Detailed description shown on the product detail page
                    </p>
                  </div>

                  <div>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={8}
                      placeholder="Describe your product features, materials, usage scenarios, dimensions, care instructions..."
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-y"
                    />
                  </div>

                  <div className="border-b border-gray-100 pb-4 pt-2">
                    <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                    <p className="text-sm text-gray-400 mt-1">Optimize for search engines</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Title</label>
                      <input
                        type="text"
                        value={form.metaTitle}
                        onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                        placeholder="Page title for search engines"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Description</label>
                      <input
                        type="text"
                        value={form.metaDesc}
                        onChange={(e) => setForm((p) => ({ ...p, metaDesc: e.target.value }))}
                        placeholder="Meta description for search engines"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveStep('sales')}
                      className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? 'Saving...' : isNew ? 'Publish Product' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

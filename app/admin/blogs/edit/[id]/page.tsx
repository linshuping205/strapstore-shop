'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Trash2, X, CheckCircle, Loader2, Upload, Eye
} from 'lucide-react';
import RichTextEditor from '@/components/blog/RichTextEditor';

const STEPS = [
  { id: 'basic', label: 'Basic Info', desc: 'Title, slug, category, tags' },
  { id: 'media', label: 'Media & Content', desc: 'Cover image, article body' },
  { id: 'seo', label: 'SEO & Publish', desc: 'SEO settings, publish status' },
];

export default function BlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string | undefined;
  const isNew = !postId || postId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Guide',
    tags: '',
    published: false,
    metaTitle: '',
    metaDesc: '',
  });

  const loadPost = useCallback(async () => {
    if (isNew) return;
    try {
      const res = await fetch(`/api/admin/posts/${postId}`);
      if (res.ok) {
        const post = await res.json();
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          coverImage: post.coverImage || '',
          category: post.category || 'Guide',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
          published: post.published === true,
          metaTitle: post.metaTitle || '',
          metaDesc: post.metaDesc || '',
        });
      }
    } catch (e) {
      console.error('Failed to load post:', e);
    } finally {
      setLoading(false);
    }
  }, [postId, isNew]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      if (errors.title || errors.slug) setActiveStep('basic');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const url = isNew ? '/api/admin/posts' : `/api/admin/posts/${postId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        alert(isNew ? 'Post created successfully!' : 'Post saved successfully!');
        if (isNew) {
          router.push(`/admin/blogs/edit/${saved.id}`);
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
    if (!postId) return;
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Post deleted');
        router.push('/admin/blogs');
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Delete failed');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Image exceeds 4MB limit');
      return;
    }

    setUploading(true);
    try {
      const filename = `blogs/${Date.now()}_${file.name}`;
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: {
          'x-admin-auth': 'admin-secret-token-2024',
        },
        body: file,
      });
      if (res.ok) {
        const { url } = await res.json();
        setForm((p) => ({ ...p, coverImage: url }));
      } else {
        alert('Failed to upload image');
      }
    } catch {
      alert('Upload error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading post...</span>
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
              href="/admin/blogs"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Posts
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">
              {isNew ? 'New Blog Post' : 'Edit Blog Post'}
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
              href={!isNew ? `/blog/${form.slug}` : '#'}
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
              {saving ? 'Saving...' : 'Save Post'}
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
                    <p className="text-sm text-gray-400 mt-1">Post title, slug, category, and tags</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Post Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            title: val,
                            slug: isNew ? autoSlug(val) : p.slug,
                          }));
                          if (errors.title) setErrors((e) => ({ ...e, title: '' }));
                        }}
                        placeholder="Enter post title"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                          errors.title
                            ? 'border-red-300 focus:ring-red-200'
                            : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                        }`}
                      />
                      {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
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
                        {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 bg-white"
                        >
                          <option>Guide</option>
                          <option>Tips</option>
                          <option>Review</option>
                          <option>News</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
                      <textarea
                        value={form.excerpt}
                        onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                        rows={3}
                        placeholder="Short description for SEO and list view..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-y"
                      />
                      <p className="text-xs text-gray-400 mt-1">Shown in post listings and search results</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                      <input
                        type="text"
                        value={form.tags}
                        onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                        placeholder="leather, watch, strap, summer"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                      <p className="text-xs text-gray-400 mt-1">Comma separated tags</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveStep('media')}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                    >
                      Next: Media & Content →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Media & Content */}
              {activeStep === 'media' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Cover Image</h3>
                    <p className="text-sm text-gray-400 mt-1">Upload a cover image for the post</p>
                  </div>

                  <div className="space-y-4">
                    {form.coverImage ? (
                      <div className="relative w-64 h-40 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                        <button
                          onClick={() => setForm((p) => ({ ...p, coverImage: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-64 h-40 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                        {uploading ? (
                          <Loader2 size={24} className="text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <Upload size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-400">Upload Cover Image</span>
                            <span className="text-xs text-gray-300">JPG, PNG, WEBP, max 4MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Or paste image URL</label>
                      <input
                        type="text"
                        value={form.coverImage}
                        onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900">Article Content</h3>
                    <p className="text-sm text-gray-400 mt-1">Write your article using the rich text editor</p>
                  </div>

                  <div>
                    <RichTextEditor
                      initialContent={form.content}
                      onChange={(html) => setForm((p) => ({ ...p, content: html }))}
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setActiveStep('basic')}
                      className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActiveStep('seo')}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                    >
                      Next: SEO & Publish →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: SEO & Publish */}
              {activeStep === 'seo' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                    <p className="text-sm text-gray-400 mt-1">Optimize for search engines</p>
                  </div>

                  <div className="space-y-4">
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

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="published"
                          checked={form.published}
                          onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                          className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <div>
                          <label htmlFor="published" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Published / Visible on blog
                          </label>
                          <p className="text-xs text-gray-400 mt-0.5">
                            When checked, the post will be visible to readers on the blog
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveStep('media')}
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
                      {saving ? 'Saving...' : isNew ? 'Publish Post' : 'Save Changes'}
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

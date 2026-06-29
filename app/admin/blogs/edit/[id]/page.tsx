'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Trash2, X, CheckCircle, Loader2, Upload, Eye, Image,
  ChevronDown, ChevronUp
} from 'lucide-react';
import RichTextEditor from '@/components/blog/RichTextEditor';

export default function BlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string | undefined;
  const isNew = !postId || postId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    coverImageAlt: '',
    coverImageTitle: '',
    category: 'Guide',
    tags: '',
    published: false,
    metaTitle: '',
    metaDesc: '',
    metaKeywords: '',
  });

  const [panelsOpen, setPanelsOpen] = useState({
    publish: true,
    category: true,
    tags: true,
    cover: true,
    excerpt: true,
    seo: true,
  });

  const togglePanel = (key: keyof typeof panelsOpen) => {
    setPanelsOpen((p) => ({ ...p, [key]: !p[key] }));
  };

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
          coverImageAlt: post.coverImageAlt || '',
          coverImageTitle: post.coverImageTitle || '',
          category: post.category || 'Guide',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
          published: post.published === true,
          metaTitle: post.metaTitle || '',
          metaDesc: post.metaDesc || '',
          metaKeywords: post.metaKeywords || '',
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

  // Load draft from localStorage for new posts
  useEffect(() => {
    if (!isNew) return;
    const draft = localStorage.getItem('draft-post-new');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore invalid draft
      }
    }
  }, [isNew]);

  // Auto-save draft to localStorage (and silently PUT for existing posts)
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const doAutoSave = async () => {
        setAutoSaving(true);
        try {
          localStorage.setItem('draft-post-' + (postId || 'new'), JSON.stringify(form));
          setLastSaved(new Date());
          if (!isNew && postId) {
            const payload = {
              ...form,
              published: form.published,
              tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
              metaKeywords: form.metaKeywords || '',
              coverImageAlt: form.coverImageAlt || '',
              coverImageTitle: form.coverImageTitle || '',
            };
            const res = await fetch(`/api/admin/posts/${postId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              console.error('Auto-save API failed');
            }
          }
        } catch (e) {
          console.error('Auto-save error:', e);
        } finally {
          setAutoSaving(false);
        }
      };
      doAutoSave();
    }, 30000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [form, isNew, postId]);

  const formatRelativeTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `Saved ${Math.floor(diff / 3600)} hour ago`;
    return `Saved ${Math.floor(diff / 86400)} day ago`;
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (forcePublished?: boolean) => {
    if (!validate()) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setSaving(true);
    const payload = {
      ...form,
      published: forcePublished !== undefined ? forcePublished : form.published,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      metaKeywords: form.metaKeywords || '',
      coverImageAlt: form.coverImageAlt || '',
      coverImageTitle: form.coverImageTitle || '',
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
        } else if (forcePublished !== undefined) {
          setForm((p) => ({ ...p, published: forcePublished }));
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
      {/* Top sticky toolbar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blogs"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="text-sm font-medium text-gray-900">
              {form.title.trim() || 'No title'} · Post
            </span>
            <span className="text-sm text-gray-400">
              {autoSaving ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" />
                  Saving...
                </span>
              ) : lastSaved ? (
                formatRelativeTime(lastSaved)
              ) : null}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <Link
              href={!isNew ? `/blog/${form.slug}` : '#'}
              target={!isNew ? '_blank' : undefined}
              onClick={(e) => isNew && e.preventDefault()}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                !isNew
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <Eye size={16} />
              Preview
            </Link>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {form.published ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left main content */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
              {/* Big title input */}
              <div>
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
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="Add title"
                  className="w-full border-none bg-transparent text-3xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-0 px-0 py-2"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Featured Image Preview */}
              <div className="space-y-1">
                {form.coverImage ? (
                  <div className="relative group">
                    <img
                      src={form.coverImage}
                      alt={form.coverImageAlt || 'Featured image'}
                      className="w-full rounded-lg shadow-md max-h-[300px] object-cover"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Featured Image</span>
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            coverImage: '',
                            coverImageAlt: '',
                            coverImageTitle: '',
                          }))
                        }
                        className="text-xs text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Image size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Set featured image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {/* Rich text editor */}
              <RichTextEditor
                initialContent={form.content}
                onChange={(html) => setForm((p) => ({ ...p, content: html }))}
              />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Publish Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePanel('publish')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Publish
                  </span>
                  {panelsOpen.publish ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {panelsOpen.publish && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`font-medium ${
                          form.published ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        {form.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="published"
                        checked={form.published}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, published: e.target.checked }))
                        }
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <label
                        htmlFor="published"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        Published / Visible on blog
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : form.published ? 'Update' : 'Publish'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePanel('category')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </span>
                  {panelsOpen.category ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {panelsOpen.category && (
                  <div className="px-4 pb-4">
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 bg-white"
                    >
                      <option>Guide</option>
                      <option>Tips</option>
                      <option>Review</option>
                      <option>News</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Tags Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePanel('tags')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tags
                  </span>
                  {panelsOpen.tags ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {panelsOpen.tags && (
                  <div className="px-4 pb-4">
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, tags: e.target.value }))
                      }
                      placeholder="leather, watch, strap, summer"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Comma separated tags
                    </p>
                  </div>
                )}
              </div>

              {/* Excerpt Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePanel('excerpt')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Excerpt
                  </span>
                  {panelsOpen.excerpt ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {panelsOpen.excerpt && (
                  <div className="px-4 pb-4">
                    <textarea
                      value={form.excerpt}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, excerpt: e.target.value }))
                      }
                      rows={3}
                      placeholder="Short description for SEO and list view..."
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-y"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Shown in post listings and search results
                    </p>
                  </div>
                )}
              </div>

              {/* Cover Image Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePanel('cover')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cover Image
                  </span>
                  {panelsOpen.cover ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {panelsOpen.cover && (
                  <div className="px-4 pb-4 space-y-3">
                    {form.coverImage ? (
                      <div className="relative w-full h-40 rounded-md overflow-hidden border border-gray-200 group">
                        <img
                          src={form.coverImage}
                          alt={form.coverImageAlt || 'Cover'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                        <button
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              coverImage: '',
                              coverImageAlt: '',
                              coverImageTitle: '',
                            }))
                          }
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-32 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                        {uploading ? (
                          <Loader2 size={24} className="text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <Upload size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-400">
                              Upload Cover Image
                            </span>
                            <span className="text-xs text-gray-300">
                              JPG, PNG, WEBP, max 4MB
                            </span>
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

                    {form.coverImage && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={form.coverImageAlt}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                coverImageAlt: e.target.value,
                              }))
                            }
                            placeholder="Descriptive text for accessibility"
                            className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={form.coverImageTitle}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                coverImageTitle: e.target.value,
                              }))
                            }
                            placeholder="Image title for SEO"
                            className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Or paste image URL
                      </label>
                      <input
                        type="text"
                        value={form.coverImage}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, coverImage: e.target.value }))
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePanel('seo')}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    SEO
                  </span>
                  {panelsOpen.seo ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
                {panelsOpen.seo && (
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, slug: e.target.value }));
                          if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
                        }}
                        className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 transition-colors ${
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={form.metaTitle}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, metaTitle: e.target.value }))
                        }
                        placeholder="Page title for search engines"
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SEO Description
                      </label>
                      <input
                        type="text"
                        value={form.metaDesc}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, metaDesc: e.target.value }))
                        }
                        placeholder="Meta description"
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        value={form.metaKeywords}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, metaKeywords: e.target.value }))
                        }
                        placeholder="Comma separated"
                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

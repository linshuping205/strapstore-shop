'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Pencil, Trash2, Eye, RefreshCw, FileText } from 'lucide-react';
import type { Post } from '@/types/blog';
import { formatDateShort } from '@/lib/utils';

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const generateSamplePosts = async () => {
    if (!confirm('Create 4 sample blog posts?')) return;
    setLoading(true);
    const ts = Date.now();
    const samplePosts = [
      {
        title: 'How to Choose the Perfect Watch Strap for Every Occasion',
        slug: `how-to-choose-perfect-watch-strap-${ts}-1`,
        excerpt: 'A comprehensive guide to selecting watch straps for formal events, daily wear, and weekend adventures.',
        content: '<p>Choosing the right watch strap is an art that combines personal style, practical needs, and an understanding of materials.</p>',
        coverImage: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=500&fit=crop',
        category: 'Guide',
        tags: ['watch-strap', 'style-guide', 'fashion'],
        published: true,
      },
      {
        title: 'The Art of Hand-Stitching Leather: A Craftsman Journey',
        slug: `art-of-hand-stitching-leather-${ts}-2`,
        excerpt: 'Discover the traditional saddle stitch technique and the tools that make our handcrafted leather straps unique.',
        content: '<p>In a world of mass production, hand-stitched leather goods represent a connection to tradition and an appreciation for quality.</p>',
        coverImage: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=500&fit=crop',
        category: 'Craftsmanship',
        tags: ['hand-stitching', 'leather-craft', 'workshop'],
        published: true,
      },
      {
        title: 'Caring for Your Leather Strap: A Complete Maintenance Guide',
        slug: `caring-for-your-leather-strap-${ts}-3`,
        excerpt: 'Learn essential tips for cleaning, conditioning, and preserving your leather watch straps for years of enjoyment.',
        content: '<p>A quality leather watch strap is an investment that, with proper care, can last for decades.</p>',
        coverImage: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&h=500&fit=crop',
        category: 'Tips',
        tags: ['leather-care', 'maintenance', 'cleaning'],
        published: true,
      },
      {
        title: 'The Milanese Mesh: From Medieval Armor to Modern Elegance',
        slug: `milanese-mesh-history-${ts}-4`,
        excerpt: 'Explore the fascinating history of the Milanese mesh bracelet, from medieval chainmail techniques to modern watchmaking.',
        content: '<p>The Milanese mesh bracelet represents one of watchmaking most fascinating design evolutions.</p>',
        coverImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=500&fit=crop',
        category: 'History',
        tags: ['milanese-mesh', 'history', 'metal-bracelet'],
        published: true,
      },
    ];

    let created = 0;
    for (const post of samplePosts) {
      try {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post),
        });
        if (res.ok) created++;
      } catch {
        // ignore
      }
    }

    alert(`Created ${created} sample posts`);
    await loadPosts();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPosts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={generateSamplePosts}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Plus size={18} />
            Generate Samples
          </button>
          <Link
            href="/admin/blogs/edit/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Plus size={18} />
            New Post
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
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
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Likes</th>
                <th className="px-6 py-3.5">Views</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div className="font-medium text-gray-900">{post.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-mono">/{post.slug}</td>
                  <td className="px-6 py-4 text-gray-600">{post.category}</td>
                  <td className="px-6 py-4 text-gray-600 text-center">{post.likes || 0}</td>
                  <td className="px-6 py-4 text-gray-600 text-center">{post.views || 0}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDateShort(post.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      post.published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={16} />
                      </a>
                      <Link
                        href={`/admin/blogs/edit/${post.id}`}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
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
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No posts found
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

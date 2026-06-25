'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Eye } from 'lucide-react';
import RichTextEditor from '@/components/blog/RichTextEditor';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  published: boolean;
  likes: number;
  views: number;
  metaTitle: string | null;
  metaDesc: string | null;
  createdAt: string;
  _count?: { comments: number };
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

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

  // 加载数据
  useEffect(() => {
    fetch('/api/admin/posts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error('API returned non-array:', data);
          setPosts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch posts:', err);
        setPosts([]);
        setLoading(false);
      });
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
        content: '<p>Choosing the right watch strap is an art that combines personal style, practical needs, and an understanding of materials. Whether you are dressing for a boardroom meeting or a weekend adventure, the strap on your wrist makes a statement.</p><h2>Understanding Your Options</h2><p>Today market offers an impressive array of strap materials, each with unique characteristics:</p><ul><li><strong>Leather straps</strong> offer timeless elegance and develop a beautiful patina over time.</li><li><strong>Rubber straps</strong> provide durability and comfort for active lifestyles.</li><li><strong>Metal bracelets</strong> deliver a sophisticated look that transitions seamlessly from day to night.</li><li><strong>Nylon and canvas</strong> straps bring a casual, military-inspired aesthetic.</li></ul><h2>Matching Strap to Occasion</h2><p>For <strong>formal events</strong>, nothing beats a high-quality leather strap in black or deep brown. For <strong>daily office wear</strong>, consider a metal bracelet or a versatile leather strap in medium brown. For <strong>weekend activities</strong>, rubber or nylon straps offer the comfort and durability you need.</p><h2>Color Coordination Tips</h2><ul><li>Black straps pair with black shoes and belts</li><li>Brown leather complements earth tones and casual wear</li><li>Metal bracelets offer neutral versatility</li><li>Blue and green straps add personality to neutral outfits</li></ul><p>Remember, the best strap is one that makes you feel confident and comfortable.</p>',
        coverImage: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=500&fit=crop',
        category: 'Guide',
        tags: ['watch-strap', 'style-guide', 'fashion'],
        published: true,
      },
      {
        title: 'The Art of Hand-Stitching Leather: A Craftsman Journey',
        slug: `art-of-hand-stitching-leather-${ts}-2`,
        excerpt: 'Discover the traditional saddle stitch technique and the tools that make our handcrafted leather straps unique.',
        content: '<p>In a world of mass production, hand-stitched leather goods represent a connection to tradition and an appreciation for quality. Today, we take you inside our workshop to witness the meticulous process behind each strap.</p><h2>The Saddle Stitch Technique</h2><p>Unlike machine stitching, which uses a lock stitch that can unravel if one thread breaks, the saddle stitch is created by passing two needles through each hole from opposite sides. This creates a continuous line of stitching that maintains its integrity even if damaged.</p><p>Our master craftsmen use waxed linen thread, which offers superior strength, natural water resistance, and a beautiful aesthetic that ages gracefully.</p><h2>Tools of the Trade</h2><p>Each craftsman relies on a curated set of tools: the <strong>Pricking Iron</strong> creates evenly spaced holes, <strong>Awls</strong> open and shape each hole, and <strong>Clams</strong> hold the leather pieces firmly together.</p><h2>Why Hand-Stitching Matters</h2><p>A machine can produce a strap in minutes. Our craftsmen spend hours on each piece. Hand-stitched edges are more durable, the tension of each stitch is adjusted for the specific leather thickness, and corner reinforcements are hand-wrapped for maximum strength.</p><p>This dedication to craft is why our straps carry a lifetime of stories, not just years of service.</p>',
        coverImage: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=500&fit=crop',
        category: 'Craftsmanship',
        tags: ['hand-stitching', 'leather-craft', 'workshop'],
        published: true,
      },
      {
        title: 'Caring for Your Leather Strap: A Complete Maintenance Guide',
        slug: `caring-for-your-leather-strap-${ts}-3`,
        excerpt: 'Learn essential tips for cleaning, conditioning, and preserving your leather watch straps for years of enjoyment.',
        content: '<p>A quality leather watch strap is an investment that, with proper care, can last for decades. Understanding how to maintain your strap ensures it develops character rather than simply deteriorating.</p><h2>Daily Care Tips</h2><ul><li><strong>Avoid water exposure</strong> whenever possible. Leather is naturally porous and absorbs moisture.</li><li><strong>Wipe down regularly</strong> with a soft, dry cloth to remove oils and debris.</li><li><strong>Rotate your straps</strong> if you have multiple options. This gives each strap time to rest.</li><li><strong>Store properly</strong> when not in use. Keep straps away from direct sunlight and heat sources.</li></ul><h2>Seasonal Considerations</h2><p><strong>Summer</strong> brings sweat and humidity. Consider switching to rubber or nylon straps for active days. <strong>Winter</strong> introduces dry air and indoor heating. A light application of leather conditioner helps prevent cracking. <strong>Rainy seasons</strong> require extra vigilance. If your leather strap gets wet, pat it dry immediately and let it air dry naturally.</p><h2>Cleaning and Conditioning</h2><p>Every 3-6 months, give your strap a thorough treatment: clean the surface with a damp cloth and mild saddle soap, let it dry completely, apply a thin layer of quality leather conditioner, and buff gently with a soft cloth.</p><h2>When to Replace</h2><ul><li>Cracking that extends beyond the surface layer</li><li>Stitching that is fraying or coming loose</li><li>Persistent odors that do not resolve with cleaning</li><li>Significant discoloration or staining</li></ul><p>Remember, a well-cared-for leather strap does not just last longer—it tells a richer story.</p>',
        coverImage: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&h=500&fit=crop',
        category: 'Tips',
        tags: ['leather-care', 'maintenance', 'cleaning'],
        published: true,
      },
      {
        title: 'The Milanese Mesh: From Medieval Armor to Modern Elegance',
        slug: `milanese-mesh-history-${ts}-4`,
        excerpt: 'Explore the fascinating history of the Milanese mesh bracelet, from medieval chainmail techniques to modern watchmaking.',
        content: '<p>The Milanese mesh bracelet represents one of watchmaking most fascinating design evolutions. What began as a technique for crafting flexible armor has become synonymous with refined elegance in horology.</p><h2>Historical Origins</h2><p>The technique dates back to the medieval period, when armorers in Milan developed methods for interlocking metal rings to create flexible, protective chainmail. This same interlocking principle was adapted for jewelry in the 19th century, creating what we now know as the Milanese mesh.</p><p>Key characteristics include ultra-fine wire construction (typically 0.5mm or thinner), interlocking spiral pattern, magnetic or sliding clasp, and ability to conform perfectly to any wrist shape.</p><h2>Modern Manufacturing</h2><p>Today Milanese mesh bracelets blend traditional techniques with modern precision. High-quality mesh starts with surgical-grade stainless steel wire, drawn to exacting thickness tolerances. Finishing processes include polishing, brushing, and IP coating for color options.</p><h2>Styling the Milanese Mesh</h2><p><strong>Dress watches</strong> benefit from the bracelet refined appearance and slim profile. <strong>Vintage-inspired pieces</strong> pair beautifully with mesh, as the style was particularly popular in the 1960s and 70s. <strong>Minimalist designs</strong> find a perfect complement in the mesh understated texture.</p><p>The Milanese mesh proves that sometimes the most enduring designs come from unexpected origins.</p>',
        coverImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=500&fit=crop',
        category: 'History',
        tags: ['milanese-mesh', 'history', 'metal-bracelet'],
        published: true,
      },
    ];

    let created = 0;
    let failed = 0;
    const errors: string[] = [];
    for (const post of samplePosts) {
      try {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post),
        });
        if (res.ok) {
          created++;
        } else {
          const err = await res.json().catch(() => ({}));
          failed++;
          errors.push(`${post.title}: ${err.error || res.statusText}`);
        }
      } catch (e: any) {
        failed++;
        errors.push(`${post.title}: ${e.message}`);
      }
    }

    if (failed > 0) {
      alert(`Created ${created} / ${samplePosts.length} posts.\nFailed:\n${errors.join('\n')}`);
    } else {
      alert(`Created ${created} sample posts successfully!`);
    }
    
    // Refresh list
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error('API returned non-array:', data);
      }
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
    
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: '', slug: '', excerpt: '', content: '',
      coverImage: '', category: 'Guide', tags: '', published: false,
      metaTitle: '', metaDesc: '',
    });
    setShowModal(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      category: post.category,
      tags: post.tags.join(', '),
      published: post.published,
      metaTitle: post.metaTitle || '',
      metaDesc: post.metaDesc || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return;

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const url = editing ? `/api/admin/posts/${editing.id}` : '/api/admin/posts';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const saved = await res.json();
      if (editing) {
        setPosts((prev) => prev.map((p) => (p.id === editing.id ? saved : p)));
      } else {
        setPosts((prev) => [saved, ...prev]);
      }
      setShowModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={generateSamplePosts}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Plus size={18} /> Generate Samples
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Plus size={18} /> New Post
          </button>
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
                  <td className="px-6 py-4 font-medium text-gray-900">{post.title}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-mono">/{post.slug}</td>
                  <td className="px-6 py-4 text-gray-600">{post.category}</td>
                  <td className="px-6 py-4 text-gray-600 text-center">{post.likes || 0}</td>
                  <td className="px-6 py-4 text-gray-600 text-center">{post.views || 0}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString()}
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
                      <button
                        onClick={() => openEdit(post)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                      >
                        <Pencil size={16} />
                      </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Post' : 'New Post'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setForm((p) => ({
                        ...p,
                        title: t,
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  placeholder="Short description for SEO and list view..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <RichTextEditor
                  initialContent={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Guide</option>
                    <option>Tips</option>
                    <option>Review</option>
                    <option>News</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="leather, watch, strap, summer"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-400 mt-1">Comma separated</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700">
                    Published
                  </label>
                </div>
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
                {editing ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

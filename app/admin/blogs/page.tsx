'use client';

import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Eye } from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: 'Published' | 'Draft';
  date: string;
}

const initialBlogs: Blog[] = [
  { id: 1, title: 'Rubber vs Leather vs Metal Watch Strap', slug: 'rubber-vs-leather-vs-metal', category: 'Guide', status: 'Published', date: '2026-06-20' },
  { id: 2, title: 'How to Care for Your Leather Strap', slug: 'leather-strap-care', category: 'Tips', status: 'Published', date: '2026-06-18' },
  { id: 3, title: 'Top 5 NATO Straps for Summer 2026', slug: 'top-nato-straps-2026', category: 'Review', status: 'Draft', date: '2026-06-15' },
];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'Guide',
    status: 'Published' as 'Published' | 'Draft',
  });

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', slug: '', category: 'Guide', status: 'Published' });
    setShowModal(true);
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      status: blog.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.slug) return;
    if (editing) {
      setBlogs((prev) =>
        prev.map((b) => (b.id === editing.id ? { ...b, ...form } : b))
      );
    } else {
      const newBlog: Blog = {
        id: Date.now(),
        ...form,
        date: new Date().toISOString().split('T')[0],
      };
      setBlogs((prev) => [newBlog, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this blog post?')) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus size={18} />
          New Post
        </button>
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
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{blog.title}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">/{blog.slug}</td>
                  <td className="px-6 py-4 text-gray-600">{blog.category}</td>
                  <td className="px-6 py-4 text-gray-600">{blog.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      blog.status === 'Published'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(blog)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                    No blog posts found
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
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Post' : 'New Post'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="rubber-vs-leather-vs-metal"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'Published' | 'Draft' })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
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
                {editing ? 'Save Changes' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

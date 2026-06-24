"use client";

import { useState, useEffect, useCallback } from "react";
import RichTextEditor from "@/components/blog/RichTextEditor";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  likes: number;
  views: number;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", category: "", tags: "", published: false,
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) { console.error("Failed to fetch posts", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", category: "", tags: "", published: false });
    setEditingPost(null); setIsCreating(false);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content || "",
      category: post.category || "", tags: post.tags?.join(", ") || "", published: post.published,
    });
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      const url = editingPost ? `/api/admin/posts/${editingPost.id}` : "/api/admin/posts";
      const method = editingPost ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { resetForm(); fetchPosts(); } else { const err = await res.json(); alert(err.error || "\u4fdd\u5b58\u5931\u8d25"); }
    } catch (e) { alert("\u7f51\u7edc\u9519\u8bef"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("\u786e\u5b9a\u5220\u9664\u8fd9\u7bc7\u6587\u7ae0?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) fetchPosts(); else alert("\u5220\u9664\u5931\u8d25");
    } catch (e) { alert("\u7f51\u7edc\u9519\u8bef"); }
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{editingPost ? "\u7f16\u8f91\u6587\u7ae0" : "\u65b0\u5efa\u6587\u7ae0"}</h1>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">\u8fd4\u56de\u5217\u8868</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">\u6807\u9898</label>
                <input type="text" value={form.title} onChange={e => { const title = e.target.value; setForm(p => ({ ...p, title, slug: editingPost ? p.slug : generateSlug(title) })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">\u5206\u7c7b</label>
                <input type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u5982: \u6280\u672f, \u751f\u6d3b" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">\u6807\u7b7e</label>
                <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u7528\u9017\u53f7\u5206\u9694\u591a\u4e2a\u6807\u7b7e" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">\u6458\u8981</label>
              <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" placeholder="\u6587\u7ae0\u6458\u8981\uff0c\u7528\u4e8e\u5217\u8868\u5c55\u793a" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                \u6b63\u6587\u5185\u5bb9
                <span className="text-gray-400 text-xs ml-2">\u70b9\u51fb\u5de5\u5177\u680f\u201c\u56fe\u7247\u201d\u6309\u94ae\u53ef\u4e0a\u4f20\u672c\u5730\u56fe\u7247\uff0c\u4e5f\u652f\u6301\u62d6\u62fd\u4e0a\u4f20</span>
              </label>
              <RichTextEditor initialContent={form.content} onChange={content => setForm(p => ({ ...p, content }))} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm">\u7acb\u5373\u53d1\u5e03</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? "\u4fdd\u5b58\u4e2d..." : "\u4fdd\u5b58\u6587\u7ae0"}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">\u53d6\u6d88</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">\u535a\u5ba2\u7ba1\u7406</h1>
          <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            \u65b0\u5efa\u6587\u7ae0
          </button>
        </div>
        {loading && posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">\u52a0\u8f7d\u4e2d...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-400 mb-4">\u6682\u65e0\u6587\u7ae0</p>
            <button onClick={() => setIsCreating(true)} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">\u521b\u5efa\u7b2c\u4e00\u7bc7\u6587\u7ae0</button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">\u6807\u9898</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">\u5206\u7c7b</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">\u72b6\u6001</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">\u70b9\u8d5e</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">\u9605\u8bfb</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">\u64cd\u4f5c</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium text-sm">{post.title}</div><div className="text-xs text-gray-400">/{post.slug}</div></td>
                    <td className="px-4 py-3 text-sm">{post.category || "-"}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{post.published ? "\u5df2\u53d1\u5e03" : "\u8349\u7a3f"}</span></td>
                    <td className="px-4 py-3 text-sm">{post.likes || 0}</td>
                    <td className="px-4 py-3 text-sm">{post.views || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(post)} className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">\u7f16\u8f91</button>
                        <button onClick={() => handleDelete(post.id)} className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors">\u5220\u9664</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

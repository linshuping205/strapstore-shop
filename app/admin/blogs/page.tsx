"use client";

import { useState } from "react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: "Published" | "Draft" | "Scheduled";
  author: string;
  date: string;
  views: number;
}

const initialPosts: BlogPost[] = [
  { id: 1, title: "Rubber vs Leather vs Metal Watch Strap: Which One is Right for You?", slug: "rubber-vs-leather-vs-metal", excerpt: "A comprehensive guide to choosing the perfect watch strap material for your lifestyle and wristwatch.", category: "Guide", status: "Published", author: "Admin", date: "2024-06-20", views: 1245 },
  { id: 2, title: "How to Care for Your Leather Watch Strap", slug: "leather-strap-care", excerpt: "Tips and tricks to extend the life of your leather watch strap and keep it looking brand new.", category: "Care", status: "Published", author: "Admin", date: "2024-06-18", views: 892 },
  { id: 3, title: "The History of NATO Watch Straps", slug: "history-of-nato-straps", excerpt: "From military origins to modern fashion staple, explore the journey of NATO straps.", category: "History", status: "Draft", author: "Admin", date: "2024-06-15", views: 0 },
  { id: 4, title: "Top 5 Metal Bracelets for Dive Watches", slug: "top-5-metal-bracelets", excerpt: "Our curated list of the best metal bracelets that pair perfectly with dive watches.", category: "Review", status: "Published", author: "Admin", date: "2024-06-12", views: 2103 },
  { id: 5, title: "Understanding Watch Strap Sizes and Compatibility", slug: "strap-sizes-guide", excerpt: "Everything you need to know about lug widths, spring bars, and strap compatibility.", category: "Guide", status: "Scheduled", author: "Admin", date: "2024-06-25", views: 0 },
];

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<BlogPost>>({ title: "", slug: "", excerpt: "", category: "", status: "Draft", author: "Admin", date: "", views: 0 });

  const filtered = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = () => {
    if (!form.title) return;
    const slug = form.slug || generateSlug(form.title);
    if (editingId) {
      setPosts(posts.map(p => p.id === editingId ? { ...p, ...form, slug } as BlogPost : p));
      setEditingId(null);
    } else {
      const newPost: BlogPost = {
        id: Date.now(),
        title: form.title || "",
        slug,
        excerpt: form.excerpt || "",
        category: form.category || "General",
        status: (form.status as any) || "Draft",
        author: form.author || "Admin",
        date: form.date || new Date().toISOString().split("T")[0],
        views: 0,
      };
      setPosts([newPost, ...posts]);
    }
    setForm({ title: "", slug: "", excerpt: "", category: "", status: "Draft", author: "Admin", date: "", views: 0 });
    setShowForm(false);
  };

  const handleEdit = (p: BlogPost) => {
    setForm(p);
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this blog post?")) setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Blog Posts</h2>
          <p className="text-sm text-gray-400 mt-1">Manage SEO content and articles</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", slug: "", excerpt: "", category: "", status: "Draft", author: "Admin", date: new Date().toISOString().split("T")[0], views: 0 }); }}
          className="inline-flex items-center px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition shadow-sm shadow-amber-500/20"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition" />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingId ? "Edit Post" : "New Blog Post"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: generateSlug(e.target.value)})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="Post title..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Slug</label>
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="url-slug" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                <option value="">Select Category</option>
                <option value="Guide">Guide</option>
                <option value="Review">Review</option>
                <option value="Care">Care</option>
                <option value="History">History</option>
                <option value="News">News</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Excerpt / Meta Description</label>
              <textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none" placeholder="Short description for SEO..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Publish Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition">{editingId ? "Update Post" : "Publish Post"}</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Post</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-800 max-w-xs truncate">{post.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">/{post.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{post.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      post.status === "Published" ? "bg-emerald-50 text-emerald-700" :
                      post.status === "Draft" ? "bg-gray-100 text-gray-600" :
                      "bg-sky-50 text-sky-700"
                    }`}>{post.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{post.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(post)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No posts found.</div>}
      </div>
    </div>
  );
}

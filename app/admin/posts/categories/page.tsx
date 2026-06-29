'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, FolderOpen, Trash2, Tag } from 'lucide-react';

interface CategoryStat {
  name: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { 'x-admin-auth': 'admin-secret-token-2024' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert('Category already exists');
      return;
    }
    setIsAdding(true);
    try {
      // POST is not yet implemented on the backend; add locally for now
      setCategories((prev) => [...prev, { name, count: 0 }]);
      setNewCategoryName('');
    } catch (e) {
      console.error('Failed to add category:', e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (name: string) => {
    if (!confirm(`Delete category "${name}"? This will only remove it from the local list.`))
      return;
    setCategories((prev) => prev.filter((c) => c.name !== name));
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPosts = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            {categories.length} categories · {totalPosts} posts
          </p>
        </div>
        <button
          onClick={loadCategories}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Add new category */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <FolderOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={isAdding || !newCategoryName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
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
                <th className="px-6 py-3.5">Category Name</th>
                <th className="px-6 py-3.5 text-center">Post Count</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    Loading categories...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No categories found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <tr
                    key={category.name}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <Tag size={14} className="text-amber-600" />
                        </div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {category.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(category.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Remove from list"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

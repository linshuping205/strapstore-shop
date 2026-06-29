'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Hash, Trash2 } from 'lucide-react';

interface TagStat {
  name: string;
  count: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tags', {
        headers: { 'x-admin-auth': 'admin-secret-token-2024' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTags(data.data);
      } else {
        setTags([]);
      }
    } catch (e) {
      console.error('Failed to load tags:', e);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleDelete = (name: string) => {
    if (!confirm(`Remove tag "${name}" from this list?`)) return;
    setTags((prev) => prev.filter((t) => t.name !== name));
  };

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPosts = tags.reduce((sum, t) => sum + t.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tags</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tags.length} tags · {totalPosts} usages
          </p>
        </div>
        <button
          onClick={loadTags}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
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
                <th className="px-6 py-3.5">Tag Name</th>
                <th className="px-6 py-3.5 text-center">Post Count</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && tags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    Loading tags...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    <Hash size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No tags found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tag) => (
                  <tr key={tag.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <Hash size={14} className="text-amber-600" />
                        </div>
                        <div className="font-medium text-gray-900">{tag.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {tag.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(tag.name)}
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

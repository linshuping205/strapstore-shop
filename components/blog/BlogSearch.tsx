'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Heart, Eye, MessageCircle } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  _count: { comments: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BlogSearch() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    if (search) params.set('search', search);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedCategory) params.set('category', selectedCategory);

    const res = await fetch(`/api/posts?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      setPosts(data.data);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [currentPage, search, selectedTag, selectedCategory]);

  const fetchFilters = useCallback(async () => {
    const res = await fetch('/api/posts/tags');
    const data = await res.json();
    if (data.success) {
      setTags(data.tags);
      setCategories(data.categories);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTag, selectedCategory]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div>
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === ''
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                selectedTag === tag
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-center text-sm text-gray-400 mb-8">
        {pagination && `${pagination.total} articles found`}
      </p>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      )}

      {/* Posts Grid */}
      {!loading && posts.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}/`}>
                <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-4">
                  {!!post.coverImage && post.coverImage.trim() !== '' ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <span className="text-4xl">✦</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Heart size={14} /> {post.likes}</span>
                  <span className="flex items-center gap-1"><Eye size={14} /> {post.views}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {post._count.comments}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No articles found.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm ${
                page === currentPage
                  ? 'bg-amber-600 text-white'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage >= pagination.totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

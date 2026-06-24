import Link from 'next/link';
import BlogSearch from '@/components/blog/BlogSearch';

export const metadata = {
  title: 'Journal | MasterStrap',
  description: 'Stories, guides, and inspiration from MasterStrap.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Journal</h1>
          <p className="text-gray-500">
            Stories, guides, and inspiration from MasterStrap.
          </p>
        </div>

        <BlogSearch />
      </div>
    </div>
  );
}

import Link from 'next/link';
import BlogSearch from '@/components/blog/BlogSearch';
import { prisma } from '@/lib/prisma';

async function getBlogSettings() {
  try {
    const settings = await prisma.settings.findMany();
    const result: Record<string, string> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    return result;
  } catch { return {}; }
}

export async function generateMetadata() {
  const settings = await getBlogSettings();
  const siteTitle = settings.siteTitle || 'MasterStrap';
  return {
    title: `Journal | ${siteTitle}`,
    description: `Stories, guides, and inspiration from ${siteTitle}. Premium watch straps and accessories.`,
    keywords: ['blog', 'watch strap', 'journal', 'leather craft', 'watch accessories'],
    openGraph: {
      title: `Journal | ${siteTitle}`,
      description: `Stories, guides, and inspiration from ${siteTitle}.`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
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

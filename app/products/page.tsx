import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Watch Straps',
  description: 'Browse our complete collection of premium leather, rubber, and metal watch straps. Filter by material, size, and style.',
  openGraph: {
    images: ['/images/og-products.jpg'],
  },
};

export const revalidate = 3600;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">All Straps</h1>
      <p className="text-gray-500 mb-8">{products.length} products</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

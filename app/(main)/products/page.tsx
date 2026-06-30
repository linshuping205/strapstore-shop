import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import ProductsFilter from '@/components/ProductsFilter'
import { Package } from 'lucide-react'
import type { Product } from '@/types'
import { serializeProducts } from '@/lib/utils'

export const revalidate = 60; // ISR: re-generate every 60 seconds

async function getSettings() {
  try {
    const s = await prisma.settings.findMany()
    const r: Record<string, string> = {}
    s.forEach((x) => { r[x.key] = x.value })
    return r
  } catch { return {} }
}

export async function generateMetadata() {
  const settings = await getSettings()
  const siteTitle = settings.siteTitle || 'MasterStrap'
  return {
    title: `All Products | ${siteTitle}`,
    description: `Premium watch straps crafted from the finest materials. Browse the full collection at ${siteTitle}.`,
    keywords: ['watch straps', 'watch bands', 'leather strap', 'premium accessories', 'MasterStrap'],
    openGraph: {
      title: `All Products | ${siteTitle}`,
      description: `Premium watch straps crafted from the finest materials. Browse the full collection at ${siteTitle}.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `All Products | ${siteTitle}`,
      description: `Premium watch straps crafted from the finest materials. Browse the full collection at ${siteTitle}.`,
    },
    alternates: {
      canonical: '/products/',
    },
  }
}

export default async function ProductsPage() {
  let products: Product[] = []

  try {
    const rawProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    products = serializeProducts(rawProducts)
  } catch {
    // Database not available during build
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">All Products</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Premium watch straps crafted from the finest materials. Each piece is designed for comfort, durability, and timeless style.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No products available.</p>
            <p className="text-gray-400 text-sm mt-2">Visit admin panel to add products.</p>
          </div>
        ) : (
          <ProductsFilter products={products} />
        )}
      </div>
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import { Package } from 'lucide-react'
import type { Product } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  let products: Product[] = []

  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

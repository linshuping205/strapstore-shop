import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  let products: any[] = []

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch {
    // Database not available during build
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}/`} className="block border rounded-lg p-4 hover:shadow">
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-gray-600">${product.price.toString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

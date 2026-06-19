import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let products: any[] = []
  let posts: any[] = []

  try {
    products = await prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' }
    })
  } catch {
    // Database not available during build
  }

  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: 'desc' }
    })
  } catch {
    // Database not available during build
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Welcome to StrapStore</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}/`} className="block border rounded-lg p-4 hover:shadow">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price.toString()}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Latest Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts available.</p>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}/`} className="block border p-4 rounded hover:shadow">
                <h3 className="font-semibold">{post.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

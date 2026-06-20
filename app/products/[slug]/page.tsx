import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({ where: { slug: params.slug } })
    if (!product) return { title: 'Not Found' }
    return {
      title: product.metaTitle || product.name,
      description: product.metaDesc || product.description?.slice(0, 160)
    }
  } catch {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({ where: { slug: params.slug } })
    if (!product) notFound()

    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-xl font-bold mt-4">${product.price.toString()}</p>
      </div>
    )
  } catch {
    notFound()
  }
}

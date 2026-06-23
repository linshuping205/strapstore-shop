import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AddToCartButton from './AddToCartButton'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ 
    where: { slug: params.slug } 
  })
  
  if (!product) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full rounded-lg"
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-bold text-accent mb-6">
            ${product.price.toString()}
          </p>
          
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}

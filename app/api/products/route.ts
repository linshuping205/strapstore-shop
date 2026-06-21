export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Request body:', body)
    
    const data = {
      slug: body.slug,
      name: body.name,
      description: body.description || null,
      price: parseFloat(body.price) || 0,
      comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
      images: Array.isArray(body.images) ? body.images : (body.images ? body.images.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      category: body.category || null,
      material: body.material || null,
      sku: body.sku || null,
      stock: parseInt(body.stock) || 0,
      metaTitle: body.metaTitle || null,
      metaDesc: body.metaDesc || null,
      tags: [],
      id: body.id || crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const product = await prisma.product.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

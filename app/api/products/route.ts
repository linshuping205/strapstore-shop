export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 处理数据格式
    const data = {
      slug: body.slug,
      name: body.name,
      description: body.description || null,
      price: parseFloat(body.price) || 0,
      comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
      images: body.images || [],
      category: body.category || null,
      material: body.material || null,
      sku: body.sku || null,
      inventory: parseInt(body.inventory) || 0,
      metaTitle: body.metaTitle || null,
      metaDesc: body.metaDesc || null,
      tags: [], // 前端没传，默认空数组
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
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Products error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
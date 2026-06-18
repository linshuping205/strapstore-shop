export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    })
    
    await prisma.$disconnect()
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const order = await prisma.order.create({
      data: {
        ...body,
        status: 'pending'
      }
    })
    
    await prisma.$disconnect()
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
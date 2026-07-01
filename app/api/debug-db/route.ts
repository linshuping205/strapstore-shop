import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if hasVariants column exists
    const columns = await prisma.$queryRawUnsafe<{ column_name: string }[]>(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    
    const hasHasVariants = columns.some(c => c.column_name === 'hasVariants');
    
    // Check if product_variants table exists
    const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'product_variants'
    `);
    
    const hasVariantsTable = tables.length > 0;
    
    // Try to get a sample product with hasVariants
    let sampleProduct = null;
    try {
      sampleProduct = await prisma.$queryRawUnsafe(`
        SELECT id, name, "hasVariants" FROM products LIMIT 1
      `);
    } catch (e) {
      // Column may not exist
    }
    
    return NextResponse.json({
      hasHasVariants,
      hasVariantsTable,
      productColumns: columns.map(c => c.column_name),
      sampleProduct,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

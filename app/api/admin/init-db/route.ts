import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_TOKEN = 'admin-secret-token-2024';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    if (authHeader !== ADMIN_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    try {
      await prisma.post.findMany({ take: 1 });
      results.push('posts: OK');
    } catch (e: any) {
      results.push(`posts: ${e.message}`);
    }

    try {
      await prisma.product.findMany({ take: 1 });
      results.push('products: OK');
    } catch (e: any) {
      results.push(`products: ${e.message}`);
    }

    try {
      await prisma.settings.findMany({ take: 1 });
      results.push('settings: OK');
    } catch (e: any) {
      results.push(`settings: ${e.message}`);
    }

    try {
      await prisma.user.findMany({ take: 1 });
      results.push('users: OK');
    } catch (e: any) {
      results.push(`users: MISSING — ${e.message}`);
    }

    try {
      await prisma.productReview.findMany({ take: 1 });
      results.push('product_reviews: OK');
    } catch (e: any) {
      results.push(`product_reviews: ${e.message}`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('DB check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    if (authHeader !== ADMIN_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    // Create UserRole enum
    try {
      await prisma.$executeRaw`CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN')`;
      results.push('UserRole enum created');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        results.push('UserRole enum already exists');
      } else {
        results.push(`UserRole enum error: ${e.message}`);
      }
    }

    // Create ReviewStatus enum
    try {
      await prisma.$executeRaw`CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED')`;
      results.push('ReviewStatus enum created');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        results.push('ReviewStatus enum already exists');
      } else {
        results.push(`ReviewStatus enum error: ${e.message}`);
      }
    }

    // Create OrderStatus enum
    try {
      await prisma.$executeRaw`CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')`;
      results.push('OrderStatus enum created');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        results.push('OrderStatus enum already exists');
      } else {
        results.push(`OrderStatus enum error: ${e.message}`);
      }
    }

    // Drop and recreate users table with correct enum
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "users"`;
      results.push('Old users table dropped');

      await prisma.$executeRaw`
        CREATE TABLE "users" (
          id TEXT NOT NULL,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role "UserRole" NOT NULL DEFAULT 'USER',
          avatar TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          country TEXT,
          "postalCode" TEXT,
          bio TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "users_pkey" PRIMARY KEY (id),
          CONSTRAINT "users_email_key" UNIQUE (email)
        )
      `;
      results.push('users table created with UserRole enum');

      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" (email)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" (role)`;
      results.push('users indexes created');
    } catch (e: any) {
      results.push(`Failed to create users table: ${e.message}`);
      return NextResponse.json({ success: false, results }, { status: 500 });
    }

    // Create product_reviews table
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "product_reviews"`;

      await prisma.$executeRaw`
        CREATE TABLE "product_reviews" (
          id TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          rating INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          status "ReviewStatus" NOT NULL DEFAULT 'PENDING',
          "ipHash" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "product_reviews_pkey" PRIMARY KEY (id)
        )
      `;
      results.push('product_reviews table created');

      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "product_reviews_productId_idx" ON "product_reviews" ("productId")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "product_reviews_status_idx" ON "product_reviews" (status)`;
      results.push('product_reviews indexes created');
    } catch (e: any) {
      results.push(`product_reviews table error: ${e.message}`);
    }

    return NextResponse.json({ success: true, message: 'Database initialization complete', results });
  } catch (error: any) {
    console.error('DB init error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

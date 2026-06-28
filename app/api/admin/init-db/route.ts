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

    try {
      await prisma.user.findMany({ take: 1 });
      results.push('users table already exists — no action needed');
    } catch {
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "users" (
            id TEXT NOT NULL,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
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
        results.push('users table created successfully');

        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" (email)`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" (role)`;
        results.push('users indexes created');
      } catch (e: any) {
        results.push(`Failed to create users table: ${e.message}`);
        return NextResponse.json({ success: false, results }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Database initialization complete', results });
  } catch (error: any) {
    console.error('DB init error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// In-memory cache for settings (suitable for serverless, per-instance)
let cachedSettings: Record<string, string> | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 300_000; // 5 minutes

async function ensureSettingsTable() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "settings" LIMIT 1`;
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.code === 'P2021') {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "settings" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "settings_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "settings_key_key" UNIQUE ("key")
        )
      `;
    }
  }
}

export async function GET() {
  try {
    // Serve from cache if still valid
    if (cachedSettings && Date.now() < cacheExpiresAt) {
      return NextResponse.json(cachedSettings, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }

    await ensureSettingsTable();
    const settings = await prisma.settings.findMany();
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    // Update cache
    cachedSettings = result;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureSettingsTable();
    const body = await request.json();
    const keys = Object.keys(body);

    // Validate tagline
    if (body.tagline !== undefined && String(body.tagline).trim().length < 3) {
      return NextResponse.json({ error: 'Tagline must be at least 3 characters' }, { status: 400 });
    }
    if (body.siteTitle !== undefined && String(body.siteTitle).trim().length < 2) {
      return NextResponse.json({ error: 'Site title must be at least 2 characters' }, { status: 400 });
    }

    await prisma.$transaction(
      keys.map((key) =>
        prisma.settings.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: { key, value: String(body[key]) },
        })
      )
    );

    // Invalidate cache after update
    cachedSettings = null;
    cacheExpiresAt = 0;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}

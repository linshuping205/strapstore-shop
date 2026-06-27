import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    await ensureSettingsTable();
    const settings = await prisma.settings.findMany();
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return NextResponse.json(result);
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
    
    await prisma.$transaction(
      keys.map((key) =>
        prisma.settings.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: { key, value: String(body[key]) },
        })
      )
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}

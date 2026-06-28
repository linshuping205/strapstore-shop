import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const ADMIN_AUTH_TOKEN = 'admin-secret-token-2024';

export async function POST(request: NextRequest) {
  try {
    // Admin auth check via x-admin-auth header (same as other admin APIs)
    const adminAuth = request.headers.get('x-admin-auth');
    if (adminAuth !== ADMIN_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'image.jpg';

    const blob = await request.blob();
    if (blob.size === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }
    if (blob.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(blob.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 });
    }

    // Safe filename
    const safeName = filename.replace(/[^a-zA-Z0-9._\-/]/g, '_');

    const result = await put(safeName, blob, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: result.url, pathname: result.pathname });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

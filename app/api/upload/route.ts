import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Ensure Node.js runtime (not Edge) for Blob SDK compatibility
export const runtime = 'nodejs';

// Extend timeout for large uploads (Vercel Hobby max is 60s for serverless)
export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || 'image.jpg';

  if (!request.body) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Check env var is available
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set');
    return NextResponse.json(
      { error: 'Blob storage not configured. Please connect a Vercel Blob store in your project settings.' },
      { status: 500 }
    );
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error: any) {
    console.error('Blob upload error:', error.message || error);
    return NextResponse.json(
      { error: 'Upload failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

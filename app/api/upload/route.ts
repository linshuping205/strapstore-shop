import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'image.jpg';

    const blob = await request.blob();
    if (blob.size === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    const result = await put(filename, blob, {
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

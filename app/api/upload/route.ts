import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'image.jpg';

    // 诊断信息
    const diagnostics: any = {
      filename,
      hasBody: !!request.body,
      contentType: request.headers.get('content-type'),
      envTokenSet: !!process.env.BLOB_READ_WRITE_TOKEN,
      envTokenLength: process.env.BLOB_READ_WRITE_TOKEN ? process.env.BLOB_READ_WRITE_TOKEN.length : 0,
    };

    if (!request.body) {
      return NextResponse.json(
        { error: 'No file provided', diagnostics },
        { status: 400 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN not configured. Please reconnect Vercel Blob store and redeploy.', diagnostics },
        { status: 500 }
      );
    }

    // 读取 body 为 ArrayBuffer（更安全的处理方式）
    const arrayBuffer = await request.arrayBuffer();
    diagnostics.bodySize = arrayBuffer.byteLength;

    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Empty file body', diagnostics },
        { status: 400 }
      );
    }

    // 使用 Buffer 传给 put
    const buffer = Buffer.from(arrayBuffer);

    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      success: true,
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed: ' + (error?.message || String(error)),
        stack: error?.stack?.substring(0, 500),
        type: error?.constructor?.name,
      },
      { status: 500 }
    );
  }
}

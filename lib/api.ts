import { NextResponse } from 'next/server';

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 500, code?: string) {
  const body: { error: string; code?: string } = { error: message };
  if (code) body.code = code;
  return NextResponse.json(body, { status });
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export const prismaErrorCodes: Record<string, { message: string; status: number }> = {
  P2002: { message: 'Duplicate entry. This record already exists.', status: 409 },
  P2025: { message: 'Record not found.', status: 404 },
  P2003: { message: 'Foreign key constraint failed.', status: 400 },
};

export function handlePrismaError(error: any): NextResponse {
  const code = error?.code as string;
  if (code && prismaErrorCodes[code]) {
    const { message, status } = prismaErrorCodes[code];
    return errorResponse(message, status, code);
  }
  console.error('Prisma error:', error);
  return errorResponse(error?.message || 'Database error', 500);
}

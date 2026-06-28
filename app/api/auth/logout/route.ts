import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api';

export async function POST() {
  try {
    await clearAuthCookie();
    return successResponse({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return successResponse({ message: 'Logged out' });
  }
}

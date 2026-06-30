import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { NextResponse } from 'next/server';

// Cache for me endpoint (per-instance, user-specific key)
interface UserCacheEntry {
  data: any;
  expiresAt: number;
}
const userCache = new Map<string, UserCacheEntry>();
const CACHE_TTL_MS = 300_000; // 5 minutes

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return errorResponse('Not authenticated', 401, 'UNAUTHORIZED');
    }

    // Check cache for this user
    const cached = userCache.get(authUser.userId);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ success: true, data: cached.data }, {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        bio: true,
        createdAt: true,
      },
    });
    if (!user) {
      return errorResponse('User not found', 404, 'USER_NOT_FOUND');
    }

    // Populate cache
    userCache.set(authUser.userId, { data: { user }, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json({ success: true, data: { user } }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return errorResponse(error.message || 'Failed to get user', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return errorResponse('Not authenticated', 401, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const { name, phone, address, city, country, postalCode, bio } = body;

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(country !== undefined && { country: country || null }),
        ...(postalCode !== undefined && { postalCode: postalCode || null }),
        ...(bio !== undefined && { bio: bio || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        bio: true,
        createdAt: true,
      },
    });

    // Invalidate cache after update
    userCache.delete(authUser.userId);

    return successResponse({ user });
  } catch (error: any) {
    console.error('Update user error:', error);
    return errorResponse(error.message || 'Failed to update user', 500);
  }
}

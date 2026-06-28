import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return errorResponse('Not authenticated', 401, 'UNAUTHORIZED');
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
    return successResponse({ user });
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
    return successResponse({ user });
  } catch (error: any) {
    console.error('Update user error:', error);
    return errorResponse(error.message || 'Failed to update user', 500);
  }
}

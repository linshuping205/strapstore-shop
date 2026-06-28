import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403, 'UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return errorResponse(error.message || 'Failed to get users', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return errorResponse('User ID and role are required', 400, 'MISSING_FIELDS');
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      return errorResponse('Invalid role', 400, 'INVALID_ROLE');
    }

    // Prevent admin from demoting themselves
    if (id === authUser.userId && role === 'USER') {
      return errorResponse('Cannot demote yourself', 400, 'CANNOT_DEMO_SELF');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return successResponse({ user });
  } catch (error: any) {
    console.error('Update user role error:', error);
    return errorResponse(error.message || 'Failed to update user role', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403, 'UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('User ID is required', 400, 'MISSING_ID');
    }

    if (id === authUser.userId) {
      return errorResponse('Cannot delete yourself', 400, 'CANNOT_DELETE_SELF');
    }

    await prisma.user.delete({ where: { id } });

    return successResponse({ message: 'User deleted' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return errorResponse(error.message || 'Failed to delete user', 500);
  }
}

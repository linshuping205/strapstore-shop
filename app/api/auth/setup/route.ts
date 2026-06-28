import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api';

export async function GET() {
  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    return successResponse({ setupRequired: adminCount === 0 });
  } catch (error: any) {
    console.error('Setup check error:', error);
    return errorResponse(error.message || 'Failed to check setup status', 500);
  }
}

export async function POST(request: Request) {
  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      return errorResponse('Admin already exists. Setup is only allowed once.', 403, 'SETUP_ALREADY_DONE');
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return errorResponse('Email, password and name are required', 400, 'MISSING_FIELDS');
    }
    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400, 'WEAK_PASSWORD');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400, 'INVALID_EMAIL');
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setAuthCookie(token);

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, 201);
  } catch (error: any) {
    console.error('Setup error:', error);
    return errorResponse(error.message || 'Setup failed', 500);
  }
}

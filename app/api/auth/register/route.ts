import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api';

export async function POST(request: Request) {
  try {
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

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return errorResponse('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = await createToken({
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
    console.error('Register error:', error);
    return errorResponse(error.message || 'Registration failed', 500);
  }
}

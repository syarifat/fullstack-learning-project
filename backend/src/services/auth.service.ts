import prisma from '../config/database';
import redis from '../config/redis';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/auth';
import { UserRole } from '@prisma/client';

export const registerUser = async (email: string, password: string, role: UserRole, name: string) => {
  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);

  // Create user + profile in transaction
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      profile: {
        create: { name }
      }
    },
    include: { profile: true }
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token in Redis (7 days TTL)
  await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { profile: true }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = await import('../utils/auth').then(m => m.verifyRefreshToken(refreshToken));
  
  const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
  if (!storedToken || storedToken !== refreshToken) {
    throw new Error('Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const accessToken = generateAccessToken(user.id, user.role);
  return { accessToken };
};

export const logoutUser = async (userId: string) => {
  await redis.del(`refresh_token:${userId}`);
};

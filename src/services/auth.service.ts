import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { redisClient } from '../utils/redis';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Cache user data in Redis (15 minutes)
    await redisClient.set(
      `user:${user.id}`,
      JSON.stringify({ id: user.id, email: user.email }),
      900
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Cache user data
    await redisClient.set(
      `user:${user.id}`,
      JSON.stringify({ id: user.id, email: user.email }),
      900
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    const payload = verifyRefreshToken(token);

    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.isRevoked) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    return { accessToken };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Revoke refresh token
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
      },
      data: {
        isRevoked: true,
      },
    });

    // Clear user cache
    await redisClient.delete(`user:${userId}`);
  }

  async revokeAllTokens(userId: string): Promise<void> {
    // Revoke all refresh tokens for user
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    // Clear user cache
    await redisClient.delete(`user:${userId}`);
  }
}

export const authService = new AuthService();

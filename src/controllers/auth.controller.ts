import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = req.user!.userId;

      await authService.logout(userId, refreshToken);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  }

  async revokeAllTokens(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await authService.revokeAllTokens(userId);
      res.status(200).json({
        success: true,
        message: 'All tokens revoked successfully',
      });
    } catch (error) {
      logger.error('Token revocation error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Token revocation failed',
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Try to get from cache first
      const { redisClient } = await import('../utils/redis');
      const cachedUser = await redisClient.get(`user:${userId}`);

      if (cachedUser) {
        res.status(200).json({
          success: true,
          data: JSON.parse(cachedUser),
          cached: true,
        });
        return;
      }

      // If not in cache, get from database
      const { prisma } = await import('../utils/database');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Cache for next time
      await redisClient.set(`user:${userId}`, JSON.stringify(user), 900);

      res.status(200).json({
        success: true,
        data: user,
        cached: false,
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      });
    }
  }
}

export const authController = new AuthController();

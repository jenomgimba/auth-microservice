import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { redisClient } from '../utils/redis';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

// Custom Redis-based rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
  store: {
    async increment(key: string): Promise<{ totalHits: number; resetTime: Date | undefined }> {
      const redisKey = `ratelimit:${key}`;
      const ttl = 15 * 60; // 15 minutes in seconds

      const current = await redisClient.increment(redisKey, ttl);
      const resetTime = new Date(Date.now() + ttl * 1000);

      return {
        totalHits: current,
        resetTime,
      };
    },
    async decrement(key: string): Promise<void> {
      const redisKey = `ratelimit:${key}`;
      const value = await redisClient.get(redisKey);
      if (value && parseInt(value) > 0) {
        await redisClient.set(redisKey, (parseInt(value) - 1).toString());
      }
    },
    async resetKey(key: string): Promise<void> {
      const redisKey = `ratelimit:${key}`;
      await redisClient.delete(redisKey);
    },
  },
});

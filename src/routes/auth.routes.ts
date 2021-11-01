import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// Public routes
router.post(
  '/register',
  authRateLimiter,
  validate(registerValidation),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginValidation),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validate(refreshTokenValidation),
  authController.refreshToken.bind(authController)
);

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));

router.post(
  '/revoke-all',
  authenticate,
  authController.revokeAllTokens.bind(authController)
);

router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;

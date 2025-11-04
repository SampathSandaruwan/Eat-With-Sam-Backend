import { Router } from 'express';

import { login, logout, logoutAll, refreshToken, register } from '../controllers';
import { authenticate, validate } from '../middlewares';
import {
  loginSchema,
  logoutAllSchema,
  logoutSchema,
  refreshTokenSchema,
  registerUserUnifiedSchema,
} from '../validations';

const router = Router();

// Register endpoint supports both email/password and Google OAuth
router.post('/signup', validate(registerUserUnifiedSchema), register);

// Login endpoint for email/password authentication
router.post('/login', validate(loginSchema), login);

// Refresh token endpoint with token rotation
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Logout endpoint - revoke current refresh token (requires authentication)
router.post('/logout', authenticate, validate(logoutSchema), logout);

// Logout from all devices - revoke all refresh tokens (requires authentication)
router.post('/logout-all', authenticate, validate(logoutAllSchema), logoutAll);

export default router;


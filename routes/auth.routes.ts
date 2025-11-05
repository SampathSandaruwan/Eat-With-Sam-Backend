import { Router } from 'express';

import { googleAuth, login, logout, logoutAll, refreshToken, register } from '../controllers';
import { authenticate, validate } from '../middlewares';
import {
  googleAuthSchema,
  loginSchema,
  logoutAllSchema,
  logoutSchema,
  refreshTokenSchema,
  registerUserSchema,
} from '../validations';

const router = Router();

// Basic login way - Register user with email/password
router.post('/signup', validate(registerUserSchema), register);

// Basic login way - Login user with email/password
router.post('/login', validate(loginSchema), login);

// Google OAuth - Handles both registration and login
router.post('/google', validate(googleAuthSchema), googleAuth);

// Refresh token endpoint with token rotation
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Logout endpoint - revoke current refresh token (requires authentication)
router.post('/logout', authenticate, validate(logoutSchema), logout);

// Logout from all devices - revoke all refresh tokens (requires authentication)
router.post('/logout-all', authenticate, validate(logoutAllSchema), logoutAll);

export default router;


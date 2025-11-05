import { Request, Response } from 'express';
import { Op } from 'sequelize';

import { generateAndStoreTokens } from '../helpers';
import { RefreshTokenModel, UserModel } from '../models';
import { RegisterUserRequestBody, User } from '../types';
import { verifyRefreshToken } from '../utils';

/**
 * Generate and send tokens to the client
 * @param res Response object
 * @param user User model instance
 * @param message Message to send to the client
 * @param deviceInfo Optional device information
 */
const _generateAndSendTokens = async (res: Response, user: UserModel, message: string, deviceInfo?: string | null) => {
  const tokens = await generateAndStoreTokens(
    user,
    deviceInfo ?? `New Device: ${new Date().toISOString()}`,
  );

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    },
    message,
  });
};

/**
 * Register a new user with email and password
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      name,
      phoneNumber,
      address,
    }: RegisterUserRequestBody = req.body;

    // Normalize email to lowercase for consistent querying (validation ensures email exists)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with this email
    const existingUser = await UserModel.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Email already exists - this should use login endpoint instead
      res.status(409).json({
        success: false,
        error: 'Email already exists. Please use the login endpoint.',
      });
      return;
    }

    // New email/password user - proceed with registration
    const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: normalizedEmail,
      name,
      passwordHash: password, // Will be hashed by beforeCreate hook
      phoneNumber: phoneNumber ?? null,
      address: address ?? null,
      isActive: true,
    };

    const user = await UserModel.create(userData);

    // Generate and store tokens
    const deviceInfo = req.headers['user-agent'];
    _generateAndSendTokens(res, user, 'User registered and logged in successfully', deviceInfo);
    return;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error registering user:', error);

    // Handle validation errors from model hooks
    if (error instanceof Error && error.message.includes('password or googleId')) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to register user',
    });
  }
};

/**
 * Google OAuth authentication (handles both registration and login)
 * Requires: email + googleId
 * Optional: name, phoneNumber, address (name required only for new registrations)
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      googleId,
      name,
      phoneNumber,
      address,
    }: RegisterUserRequestBody = req.body;

    // Check if user exists with this googleId (login flow)
    const existingUserByGoogleId = await UserModel.findOne({
      where: { googleId },
    });

    if (existingUserByGoogleId) {
      // User exists with this Google ID - this is a login
      // Check if user account is active
      if (!existingUserByGoogleId.isActive) {
        res.status(403).json({
          success: false,
          error: 'Account is disabled. Please contact support.',
        });
        return;
      }

      const deviceInfo = req.headers['user-agent'];
      _generateAndSendTokens(res, existingUserByGoogleId, 'Login successful', deviceInfo);
      return;
    }

    // Normalize email to lowercase for consistent querying (validation ensures email exists)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists with this email but different auth method
    const existingUserByEmail = await UserModel.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUserByEmail) {
      // User exists with email but no googleId - link Google account
      if (!existingUserByEmail.googleId) {
        existingUserByEmail.googleId = googleId;
        await existingUserByEmail.save();

        const deviceInfo = req.headers['user-agent'];
        _generateAndSendTokens(res, existingUserByEmail, 'Google account linked successfully', deviceInfo);
        return;
      } else {
        // Email exists but with a different googleId
        res.status(409).json({
          success: false,
          error: 'Email already exists with a different Google account',
        });
        return;
      }
    }

    // New Google OAuth user - proceed with registration
    // Name is required for new user registration
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Name is required for new user registration',
      });
      return;
    }

    const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: normalizedEmail,
      name,
      googleId,
      phoneNumber: phoneNumber ?? null,
      address: address ?? null,
      isActive: true,
    };

    const user = await UserModel.create(userData);

    // Generate and store tokens
    const deviceInfo = req.headers['user-agent'];
    _generateAndSendTokens(res, user, 'Registration and login successful', deviceInfo);
    return;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error authenticating with Google:', error);

    // Handle validation errors from model hooks
    if (error instanceof Error && error.message.includes('password or googleId')) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Google',
    });
  }
};

/**
 * Login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Normalize email to lowercase for consistent querying (validation ensures email exists)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await UserModel.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Check if user has a password (not Google-only user)
    if (!user.passwordHash) {
      res.status(401).json({
        success: false,
        error: 'Please use Google OAuth to login with this account',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Check if user account is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Account is disabled. Please contact support.',
      });
      return;
    }

    // Generate and store tokens
    const deviceInfo = req.headers['user-agent'];
    _generateAndSendTokens(res, user, 'Login successful', deviceInfo);
    return;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login',
    });
  }
};

/**
 * Get the matching token for the user and refresh token
 * @param userId User ID
 * @param refreshTokenPlaintext Refresh token plaintext
 * @returns Matching token or null if not found
 */
const _getMatchingValidToken = async (
  userId: number,
  refreshTokenPlaintext: string,
): Promise<RefreshTokenModel | null> => {
  // Get ALL refresh tokens for this user (including revoked ones for theft detection)
  // We check revoked tokens to detect if a stolen token is being reused after rotation
  const allTokens = await RefreshTokenModel.findAll({
    where: {
      userId,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    order: [['createdAt', 'DESC']], // Check most recent tokens first
  });

  // Find the matching token by verifying against hashed tokens
  // Check tokens sequentially with early exit for better performance
  for (const storedToken of allTokens) {
    const isValid = await storedToken.verifyToken(refreshTokenPlaintext);
    if (isValid) {
      return storedToken;
    }
  }

  return null;
};

/**
 * Refresh access token using refresh token (with token rotation)
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: refreshTokenPlaintext } = req.body;

    if (!refreshTokenPlaintext) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    // Verify the refresh token JWT
    const decoded = verifyRefreshToken(refreshTokenPlaintext);
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
      return;
    }

    // Find the stored refresh token by checking all tokens for this user
    // We need to compare the plaintext token with hashed tokens in DB
    const user = await UserModel.findByPk(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Find the matching token
    const matchingValidToken = await _getMatchingValidToken(user.id, refreshTokenPlaintext);

    if (!matchingValidToken) {
      res.status(401).json({
        success: false,
        error: 'Refresh token not found',
      });
      return;
    }

    // STOLEN TOKEN DETECTION: If token was revoked, it means it was used after rotation
    // This indicates token theft - revoke ALL tokens for security
    if (matchingValidToken.isRevoked) {
      // eslint-disable-next-line no-console
      console.warn(
        `Security Alert: Revoked refresh token attempted to be used for user ${user.id}. This may indicate token theft. Revoking all tokens.`,
      );

      // Revoke ALL tokens for this user as a security measure
      await RefreshTokenModel.update(
        {
          isRevoked: true,
          revokedAt: new Date(),
        },
        {
          where: {
            userId: user.id,
            isRevoked: false, // Only revoke active tokens
          },
        },
      );

      res.status(401).json({
        success: false,
        error: 'Refresh token has been revoked. For security reasons, all sessions have been invalidated. Please login again.',
      });
      return;
    }

    // Check if token is expired
    if (matchingValidToken.isExpired()) {
      // Mark as revoked
      matchingValidToken.isRevoked = true;
      matchingValidToken.revokedAt = new Date();
      await matchingValidToken.save();

      res.status(401).json({
        success: false,
        error: 'Refresh token has expired',
      });
      return;
    }

    // Update lastUsedAt before rotation
    matchingValidToken.lastUsedAt = new Date();
    // Mark as revoked
    matchingValidToken.isRevoked = true;
    matchingValidToken.revokedAt = new Date();
    await matchingValidToken.save();

    // Generate new tokens
    const deviceInfo = req.headers['user-agent'] || matchingValidToken.deviceInfo;
    _generateAndSendTokens(res, user, 'Token refreshed successfully', deviceInfo);
    return;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
};

/**
 * Logout - Revoke the current refresh token
 * Requires authentication middleware
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: refreshTokenPlaintext } = req.body;
    const user = req.user; // From authentication middleware

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!refreshTokenPlaintext) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    // Verify the refresh token JWT
    const decoded = verifyRefreshToken(refreshTokenPlaintext);
    if (!decoded || decoded.userId !== user.id) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
      return;
    }

    // Find the matching token
    const matchingValidToken = await _getMatchingValidToken(user.id, refreshTokenPlaintext);

    if (!matchingValidToken) {
      res.status(401).json({
        success: false,
        error: 'Refresh token not found',
      });
      return;
    }

    // Revoke the token
    matchingValidToken.isRevoked = true;
    matchingValidToken.revokedAt = new Date();
    await matchingValidToken.save();

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
    });
  }
};

/**
 * Logout from all devices - Revoke ALL refresh tokens for the user
 * Requires authentication middleware
 */
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user; // From authentication middleware

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Revoke all active tokens for this user
    const revokedCount = await RefreshTokenModel.update(
      {
        isRevoked: true,
        revokedAt: new Date(),
      },
      {
        where: {
          userId: user.id,
          isRevoked: false, // Only revoke active tokens
        },
      },
    );

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
      data: {
        revokedTokensCount: revokedCount[0],
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging out from all devices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout from all devices',
    });
  }
};

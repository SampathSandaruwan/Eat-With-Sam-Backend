import { RefreshTokenModel } from '../models';
import { User } from '../types';
import { generateAccessToken, generateRefreshToken } from '../utils';

/**
 * Parse expiry string to Date
 * Supports formats: "7d" (days), "24h" (hours), "30m" (minutes)
 * @param expiryString Expiry string (e.g., "7d", "24h", "30m")
 * @returns Date object with expiration time
 */
const _parseExpiryToDate = (expiryString: string): Date => {
  const expiresAt = new Date();

  // Parse expiry string (e.g., "7d" = 7 days, "30d" = 30 days, "24h" = 24 hours, "30m" = 30 minutes)
  const expiryMatch = expiryString.trim().match(/^(\d+)([dhm])$/);
  if (expiryMatch) {
    const value = parseInt(expiryMatch[1], 10);
    const unit = expiryMatch[2];

    if (value <= 0 || !Number.isFinite(value)) {
      // Invalid value, default to 7 days
      expiresAt.setDate(expiresAt.getDate() + 7);
      return expiresAt;
    }

    if (unit === 'd') {
      expiresAt.setDate(expiresAt.getDate() + value);
    } else if (unit === 'h') {
      expiresAt.setHours(expiresAt.getHours() + value);
    } else if (unit === 'm') {
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
    } else {
      // Unknown unit, default to 7 days
      expiresAt.setDate(expiresAt.getDate() + 7);
    }
  } else {
    // Invalid format, default to 7 days
    // eslint-disable-next-line no-console
    console.warn(`Invalid REFRESH_TOKEN_EXPIRY format: "${expiryString}". Defaulting to 7 days. Expected format: "7d", "24h", or "30m"`);
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  return expiresAt;
};

/**
 * Generate access and refresh tokens for a user and store the refresh token
 * @param user User model instance
 * @param deviceInfo Optional device information
 * @returns Object containing accessToken and refreshToken (plaintext, before hashing)
 */
export const generateAndStoreTokens = async (
  user: User,
  deviceInfo?: string | null,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshTokenPlaintext = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  // Calculate expiration date for refresh token
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  const expiresAt = _parseExpiryToDate(refreshTokenExpiry);

  // Store refresh token (will be hashed by model hook)
  await RefreshTokenModel.create({
    token: refreshTokenPlaintext, // Will be hashed by beforeCreate hook
    userId: user.id,
    expiresAt,
    deviceInfo: deviceInfo || null,
    isRevoked: false,
  });

  return {
    accessToken,
    refreshToken: refreshTokenPlaintext, // Return plaintext to client
  };
};


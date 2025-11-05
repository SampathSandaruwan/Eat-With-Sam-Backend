import jwt from 'jsonwebtoken';

import { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET environment variable is required');
}

/**
 * Validate expiry format (supports: "7d", "24h", "30m")
 * @param expiryString Expiry string to validate
 * @param envVarName Name of environment variable for error message
 */
const _validateExpiryFormat = (expiryString: string, envVarName: string): void => {
  const expiryMatch = expiryString.trim().match(/^(\d+)([dhm])$/);
  if (!expiryMatch) {
    throw new Error(
      `Invalid ${envVarName} format: "${expiryString}". Expected format: "7d" (days), "24h" (hours), or "30m" (minutes)`,
    );
  }
  const value = parseInt(expiryMatch[1], 10);
  if (value <= 0 || !Number.isFinite(value)) {
    throw new Error(`Invalid ${envVarName} value: "${expiryString}". Value must be a positive number.`);
  }
};

// Validate expiry formats at startup
_validateExpiryFormat(ACCESS_TOKEN_EXPIRY, 'ACCESS_TOKEN_EXPIRY');
_validateExpiryFormat(REFRESH_TOKEN_EXPIRY, 'REFRESH_TOKEN_EXPIRY');

// Type assertions after validation
const JWT_SECRET_STRING: string = JWT_SECRET;
const JWT_REFRESH_SECRET_STRING: string = JWT_REFRESH_SECRET;

/**
 * Generate a short-lived access token
 * @param payload User information to include in token
 * @returns JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    JWT_SECRET_STRING,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY as string,
    } as jwt.SignOptions,
  );
};

/**
 * Generate a long-lived refresh token
 * @param payload User information to include in token
 * @returns JWT refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    JWT_REFRESH_SECRET_STRING,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY as string,
    } as jwt.SignOptions,
  );
};

/**
 * Verify and decode an access token
 * @param token JWT access token
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_STRING) as TokenPayload;
    return decoded;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error verifying access token:', error);
    return null;
  }
};

/**
 * Verify and decode a refresh token
 * @param token JWT refresh token
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET_STRING) as TokenPayload;
    return decoded;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error verifying refresh token:', error);
    return null;
  }
};


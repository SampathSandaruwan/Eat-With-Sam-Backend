import { NextFunction, Request, Response } from 'express';

import { UserModel } from '../models';
import { verifyAccessToken } from '../utils';

/**
 * Authentication middleware - verifies access token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authorization token required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    // Fetch user from database
    const user = await UserModel.findByPk(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Check if user account is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Account is disabled',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in authentication middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};


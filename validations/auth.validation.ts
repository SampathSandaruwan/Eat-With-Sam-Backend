import { z } from 'zod';

// Base user fields
const baseUserFields = {
  email: z
    .email()
    .min(1, 'Email is required')
    .transform((email) => email.toLowerCase()),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  phoneNumber: z.string().max(20).optional().nullable(),
  address: z.string().optional().nullable(),
};

// Schema for email/password registration
export const registerUserSchema = z
  .object({
    body: z
      .object({
        ...baseUserFields,
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters long')
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one lowercase letter, one uppercase letter, and one number',
          ),
        googleId: z.never().optional(), // Explicitly not allowed
      })
      .strict(),
  })
  .strict();

// Schema for Google OAuth registration
export const registerGoogleUserSchema = z
  .object({
    body: z
      .object({
        ...baseUserFields,
        googleId: z.string().min(1, 'Google ID is required'),
        password: z.never().optional(), // Explicitly not allowed
      })
      .strict(),
  })
  .strict();

// Unified schema that accepts either email/password OR Google OAuth
export const registerUserUnifiedSchema = z
  .object({
    body: z
      .object({
        ...baseUserFields,
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters long')
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one lowercase letter, one uppercase letter, and one number',
          )
          .optional(),
        googleId: z.string().min(1, 'Google ID cannot be empty').optional(),
      })
      .strict()
      .refine(
        (data) => {
          // Either password or googleId must be provided, but not both
          const hasPassword = !!data.password;
          const hasGoogleId = !!data.googleId;
          return (hasPassword && !hasGoogleId) || (!hasPassword && hasGoogleId);
        },
        {
          message:
            'Either password or googleId must be provided, but not both',
        },
      ),
    query: z.object().optional(),
    params: z.object().optional(),
  })
  .strict();

// Schema for email/password login
export const loginSchema = z
  .object({
    body: z
      .object({
        email: z
          .email()
          .min(1, 'Email is required')
          .transform((email) => email.toLowerCase()),
        password: z.string().min(1, 'Password is required'),
      })
      .strict(),
    query: z.object().optional(),
    params: z.object().optional(),
  })
  .strict();

// Schema for refresh token endpoint
export const refreshTokenSchema = z
  .object({
    body: z
      .object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
      })
      .strict(),
    query: z.object().optional(),
    params: z.object().optional(),
  })
  .strict();

// Schema for logout endpoint
export const logoutSchema = z
  .object({
    body: z
      .object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
      })
      .strict(),
    query: z.object().optional(),
    params: z.object().optional(),
  })
  .strict();

// Schema for logout-all endpoint (no body required)
export const logoutAllSchema = z
  .object({
    body: z.object().optional(),
    query: z.object().optional(),
    params: z.object().optional(),
  })
  .strict();


import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 characters long')
  .max(15, 'Phone number must not exceed 15 characters')
  .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')
  .optional();

export const registerSchema = z.object({
  body: z.object({
    customerName: z
      .string()
      .min(3, 'customerName must be at least 3 characters long')
      .max(50, 'customerName must not exceed 50 characters'),
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    password: passwordSchema,
    phone: phoneSchema,
    address: z
      .string()
      .min(5, 'Address must be at least 5 characters long')
      .max(200, 'Address must not exceed 200 characters')
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

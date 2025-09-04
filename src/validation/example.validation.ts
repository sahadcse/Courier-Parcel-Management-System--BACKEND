// # Example usage

import { z } from 'zod';

/**
 * Validation schema for updating user information
 * Validates request parameters, body, and query
 */

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "A valid user ID is required." }),
  }),
  body: z.object({
    email: z.string().email().optional(),
    name: z.string().min(2).optional(),
  }).partial().refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  }),
  query: z.object({
    includeDeleted: z.string().optional(),
  }),
});


// # Example usage

import { z } from 'zod';


// Schema for updating a user
export const updateUserSchema = z.object({
  // 1. Validate URL parameters (e.g., /users/123)
  params: z.object({
    id: z.string().uuid({ message: "A valid user ID is required." }),
  }),
  // 2. Validate the request body
  body: z.object({
    email: z.string().email().optional(),
    name: z.string().min(2).optional(),
  }).partial().refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  }),
  // 3. Validate query parameters (if any)
  query: z.object({
    includeDeleted: z.string().optional(),
  }),
});


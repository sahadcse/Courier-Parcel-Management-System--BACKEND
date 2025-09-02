import { z } from 'zod';

// Schema for validating the incoming request
export const updateStatusSchema = z.object({
  params: z.object({
    agentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid agent ID format'),
  }),
  body: z.object({
    isActive: z.boolean({
      required_error: 'isActive is required',
      invalid_type_error: 'isActive must be a boolean',
    }),
  }),
});
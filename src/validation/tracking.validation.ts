import { z } from 'zod';

/**
 * Validation schema for tracking information retrieval
 * Validates the request parameters
 */
export const getTrackingInfoSchema = z.object({
  params: z.object({
    parcelId: z
      .string()
      // .regex(
      //   // specific format
      //   /^[A-Z0-9-]+\-\d{6}\-[A-Z0-9]+\-[A-Z0-9]/,
      //   'Invalid Tracking ID format'
      // ),
  }),
});
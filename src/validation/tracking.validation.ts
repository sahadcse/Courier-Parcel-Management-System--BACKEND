import { z } from 'zod';


// Zod schema to validate the parcelId from the URL parameters
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
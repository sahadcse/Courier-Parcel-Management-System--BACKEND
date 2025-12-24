import { z } from 'zod';

export const parcelCreateSchema = z.object({
  body: z
    .object({
      pickupAddress: z.string().optional(),
      pickupExactLocation: z.string().optional(), // Made optional
      pickupCoordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
      deliveryAddress: z.string().optional(), // Made optional
      deliveryCoordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
      receiverName: z
        .string({ required_error: 'Receiver name is required' })
        .min(1),
      // Basic phone validation: digits, spaces, dashes, parentheses, optional leading +
      receiverNumber: z
        .string()
        .min(8, 'Phone number must be at least 8 digits')
        .regex(/^\+?[0-9\s\-\(\)]+$/, 'Invalid phone number format'),
      parcelType: z.string().min(1),
      parcelSize: z.enum(['small', 'medium', 'large']),
      paymentType: z.enum(['COD', 'prepaid']),
      codAmount: z.number().min(0).optional(),
    })
    .superRefine((data, ctx) => {
      // 1. Pickup Location Validation: Either text OR coordinates required
      const hasPickupText = !!data.pickupExactLocation?.trim();
      const hasPickupMap = !!data.pickupCoordinates;

      if (!hasPickupText && !hasPickupMap) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide either a Pickup Address or select a Location on the Map.',
          path: ['pickupExactLocation'], // Highlight text input by default
        });
      }

      // 2. Delivery Location Validation: Either text OR coordinates required
      const hasDeliveryText = !!data.deliveryAddress?.trim();
      const hasDeliveryMap = !!data.deliveryCoordinates;

      if (!hasDeliveryText && !hasDeliveryMap) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide either a Delivery Address or select a Location on the Map.',
          path: ['deliveryAddress'],
        });
      }

      //  Custom validation: If payment is 'COD', codAmount must be provided and > 0
      if (
        data.paymentType === 'COD' &&
        (!data.codAmount || data.codAmount <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A valid COD amount is required for COD payments.',
          path: ['codAmount'],
        });
      }
      //  Custom validation: If payment is 'prepaid', codAmount should not be set
      if (
        data.paymentType === 'prepaid' &&
        data.codAmount &&
        data.codAmount > 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'COD amount should not be set for prepaid orders.',
          path: ['codAmount'],
        });
      }
    }),
});

export const parcelGetSchema = z.object({
  params: z.object({
    parcelId: z.string().min(1, 'Parcel ID is required'),
  }),
});

//  PATCH validation: Agent can update status only
export const parcelUpdateSchema = z.object({
  body: z.object({
    status: z.enum(
      ['Booked', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed'],
      { required_error: 'Status is required' }
    ),
  }),
  params: z.object({
    parcelId: z.string().min(1, 'Parcel ID is required'),
  }),
});

//  PATCH validation: Admin can update all fields
export const parcelAdminUpdateSchema = z.object({
  body: z.object({
    assignedAgent: z.string().optional(),
    pickupAddress: z.string().optional(),
    pickupExactLocation: z.string().optional(),
    pickupCoordinates: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }).optional(),
    deliveryAddress: z.string().optional(),
    receiverName: z.string().optional(),
    receiverNumber: z.string().optional(),
    parcelType: z.string().optional(),
    parcelSize: z.enum(['small', 'medium', 'large']).optional(),
    paymentType: z.enum(['COD', 'prepaid']).optional(),
    codAmount: z.number().optional(),
    status: z.enum(
      ['Booked', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed']
    ).optional(),
    qrCode: z.string().nullable().optional(),
  }),
  params: z.object({
    parcelId: z.string().min(1, 'Parcel ID is required'),
  }),
});

export type ParcelCreateInput = z.infer<typeof parcelCreateSchema>;

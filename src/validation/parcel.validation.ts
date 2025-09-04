import { z } from 'zod';

export const parcelCreateSchema = z.object({
  body: z
    .object({
      pickupAddress: z
        .string({ required_error: 'Pickup address is required' })
        .min(1),
      deliveryAddress: z
        .string({ required_error: 'Delivery address is required' })
        .min(1),
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

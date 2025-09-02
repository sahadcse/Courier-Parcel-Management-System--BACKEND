// # TypeScript interfaces for parcels (Optimized)

import { Document, Types } from 'mongoose';

// Define the possible string literal types for enums to ensure type safety
export type ParcelSize = 'small' | 'medium' | 'large';
export type PaymentType = 'COD' | 'prepaid';
export type ParcelStatus = 'Booked' | 'Assigned' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed';

/**
 * @interface IParcel
 * @description Represents the structure of a Parcel document in MongoDB.
 * It includes all fields from the Mongoose schema and extends Mongoose's Document type.
 */
export interface IParcel extends Document {
  parcelId: string;
  sender: Types.ObjectId; // Represents the User's ID
  assignedAgent?: Types.ObjectId | null; // Optional User ID for the agent
  pickupAddress: string;
  deliveryAddress: string;
  receiverName: string;
  receiverNumber: string;
  parcelType: string;
  parcelSize: ParcelSize;
  paymentType: PaymentType;
  codAmount: number;
  status: ParcelStatus;
  qrCode?: string | null;
  createdAt: Date; // Automatically added by timestamps
  updatedAt: Date; // Automatically added by timestamps
}

/**
 * @interface ParcelCreateDTO
 * @description Data Transfer Object for creating a new parcel.
 * This represents the data expected from the client in the request body.
 * It omits server-generated fields like parcelId, sender, status, etc.
 */
export interface ParcelCreateDTO {
  pickupAddress: string;
  deliveryAddress: string;
  receiverName: string;
  receiverNumber: string;
  parcelType: string;
  parcelSize: ParcelSize;
  paymentType: PaymentType;
  codAmount?: number; // Optional, as it depends on paymentType
}

/**
 * @interface ParcelUpdateDTO
 * @description Data Transfer Object for updating an existing parcel.
 * All fields are optional, allowing clients to update only specific parts of a parcel.
 * This is typically used in PATCH requests.
 */
export type ParcelUpdateDTO = Partial<{
  assignedAgent: Types.ObjectId;
  pickupAddress: string;
  deliveryAddress: string;
  receiverName: string;
  receiverNumber: string;
  parcelType: string;
  parcelSize: ParcelSize;
  paymentType: PaymentType;
  codAmount: number;
  status: ParcelStatus;
  qrCode: string | null;
}>;


/**
 * @interface ServiceResponse
 * @description A standardized response structure for service layer functions.
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

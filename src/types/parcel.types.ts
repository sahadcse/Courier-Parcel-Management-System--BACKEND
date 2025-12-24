// src/types/parcel.types.ts

import { Document, Types } from 'mongoose';

//  Defining possible values for certain fields
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
  sender: Types.ObjectId; //  User ID of the sender
  assignedAgent?: Types.ObjectId | null; //   User ID of the assigned agent, if any
  pickupAddress: string;
  pickupExactLocation?: string; //  Made optional
  pickupCoordinates?: {
    type: 'Point';
    coordinates: number[];
  } | null;
  deliveryAddress?: string; //  Made optional
  deliveryCoordinates?: {
    type: 'Point';
    coordinates: number[];
  } | null;
  receiverName: string;
  receiverNumber: string;
  parcelType: string;
  parcelSize: ParcelSize;
  paymentType: PaymentType;
  codAmount: number;
  status: ParcelStatus;
  qrCode?: string | null;
  createdAt: Date; // Date when the parcel was created
  updatedAt: Date; // Date when the parcel was last updated
}

/**
 * @interface ParcelCreateDTO
 * @description Data Transfer Object for creating a new parcel.
 * This represents the data expected from the client in the request body.
 * It omits server-generated fields like parcelId, sender, status, etc.
 */
export interface ParcelCreateDTO {
  pickupAddress?: string;
  pickupExactLocation?: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  deliveryAddress?: string;
  deliveryCoordinates?: {
    lat: number;
    lng: number;
  };
  receiverName: string;
  receiverNumber: string;
  parcelType: string;
  parcelSize: ParcelSize;
  paymentType: PaymentType;
  codAmount?: number; // Optional, required if paymentType is 'COD'
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
  pickupExactLocation: string;
  pickupCoordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
  deliveryAddress: string;
  deliveryCoordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
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

// # Mongoose schema for parcels

import { Schema } from 'mongoose';

// Parcels Schema
export const parcelSchema = new Schema({
  parcelId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAgent: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupAddress: {
    type: String,
    required: true,
    trim: true
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true
  },
  parcelType: {
    type: String,
    required: true,
    trim: true
  },
  parcelSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['COD', 'prepaid'],
    required: true
  },
  codAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Booked', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed'],
    default: 'Booked'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  qrCode: { // Bonus: QR code data or URL
    type: String,
    default: null
  }
});

parcelSchema.index({ parcelId: 1 });
parcelSchema.index({ assignedAgent: 1 });
parcelSchema.index({ customer: 1 });
parcelSchema.index({ status: 1 });
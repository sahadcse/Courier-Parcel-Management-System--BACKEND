// # Mongoose schema for tracking

import { Schema } from 'mongoose';

// Tracking Schema
export const trackingSchema = new Schema({
  parcel: {
    type: Schema.Types.ObjectId,
    ref: 'Parcel',
    required: true
  },
  coordinates: {
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

trackingSchema.index({ parcel: 1 });
trackingSchema.index({ coordinates: '2dsphere' }); // Geospatial index
trackingSchema.index({ timestamp: 1 });
// # Mongoose schema for tracking

import mongoose, { Schema } from 'mongoose';

// Schema for the nested GeoJSON Point object
const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
}, { _id: false }); // Disable _id for this subdocument

// Main tracking schema
const trackingSchema = new Schema({
  parcel: {
    type: String,
    required: true,
    index: true,
  },
  coordinates: {
    type: pointSchema,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Geospatial index for efficient location queries
trackingSchema.index({ coordinates: '2dsphere' });

export const Tracking = mongoose.model('Tracking', trackingSchema);

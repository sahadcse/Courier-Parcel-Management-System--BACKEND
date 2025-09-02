// # Mongoose schema for parcels

import mongoose, { Schema } from 'mongoose';


const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}, { _id: false });


const parcelSchema = new Schema({
  parcelId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedAgent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  pickupAddress: {
    type: String,
    required: true,
    trim: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true,
  },
  deliveryCoordinates: {
    type: pointSchema,
    index: '2dsphere' // Important for location-based queries
  },
  receiverName: {
    type: String,
    required: true,
    trim: true,
  },
  receiverNumber: {
    type: String, 
    required: true,
    trim: true,
  },
  parcelType: {
    type: String,
    required: true,
    trim: true,
  },
  parcelSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['COD', 'prepaid'],
    required: true,
  },
  codAmount: {
    type: Number,
    default: 0,
    validate: {
      validator: function (this: any, value: number) {
        return this.paymentType !== 'COD' ? value === 0 : true;
      },
      message: 'codAmount must be 0 for prepaid payments.',
    },
  },
  status: {
    type: String,
    enum: ['Booked', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed'],
    default: 'Booked',
  },
  qrCode: {
    type: String,
    default: null,
  },
}, {
  timestamps: true, 
});

parcelSchema.index({ sender: 1, status: 1 });
parcelSchema.index({ assignedAgent: 1, status: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ parcelId: 1 });

export const Parcel = mongoose.model("Parcel", parcelSchema)
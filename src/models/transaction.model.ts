// # Mongoose schema for transactions

import { Schema } from 'mongoose';

// Transactions Schema
export const transactionSchema = new Schema({
  parcel: {
    type: Schema.Types.ObjectId,
    ref: 'Parcel',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['COD', 'prepaid'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ parcel: 1 });
transactionSchema.index({ createdAt: 1 });
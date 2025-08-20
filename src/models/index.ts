// # Export all models

import mongoose from 'mongoose';
import { userSchema } from './user.model';
import { parcelSchema } from './parcel.model';
import { trackingSchema } from './tracking.model';
import { transactionSchema } from './transaction.model';

export const User = mongoose.model('User', userSchema);
export const Parcel = mongoose.model('Parcel', parcelSchema);
export const Tracking = mongoose.model('Tracking', trackingSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
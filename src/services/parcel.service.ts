// parcel.service.ts
// Parcel Database Operations

import { Parcel, Tracking } from '../models/index'; // Assuming your model export
import { User } from '../models/index';
import { getIO } from '../config/socket';
import { ParcelCreateDTO, IParcel, ServiceResponse } from 'types/parcel.types'; // Assuming your types path
import { logger } from '../utils/logger'; // Assuming logger path
import generateParcelId from '../utils/generateParcelId'; // Assuming util path
import { AppError } from '../utils/errorHandler'; // Assuming error handler path
import { geocodeAddress } from '../utils/geocoding';
import { sendBookingConfirmationEmail } from './notification.service';

/**
 * Creates a new parcel in the database.
 * @param {ParcelCreateDTO} input - The data for the new parcel.
 * @param {string} senderId - The ID of the user creating the parcel.
 * @returns {Promise<ServiceResponse<IParcel>>} A promise that resolves to a structured response
 * containing either the created parcel or an error object.
 */
export const createParcel = async (
  input: ParcelCreateDTO,
  senderId: string
): Promise<ServiceResponse<IParcel>> => {
  try {
    const pickupAddress = input.pickupAddress?.trim() || '';
    const branchCode = pickupAddress.split(' ')[0] || 'BR001';
    const parcelId = generateParcelId(branchCode);

    const coordinates = await geocodeAddress(input.deliveryAddress);

    let deliveryCoordinates;
    if (coordinates) {
      deliveryCoordinates = {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat], // [longitude, latitude]
      };
    }

    const parcelDataToSave = {
      ...input,
      parcelId,
      sender: senderId,
      status: 'Booked',
      deliveryCoordinates,
    };

    const parcel = await Parcel.create(parcelDataToSave);

    logger.info(`Parcel created successfully with ID: ${parcel.parcelId}`);

    // Send the notification after successful creation
    const sender = await User.findById(senderId);
    if (sender && sender.email) {
      // Run this in the background without await to not slow down the API response
      sendBookingConfirmationEmail(parcel, sender.email);
    }

    return {
      success: true,
      data: parcel,
    };
  } catch (error: any) {
    logger.error(`Error creating parcel: ${error.message}`, {
      error,
      input,
      senderId,
    });

    // Handle Mongoose validation errors specifically for better client feedback
    if (error.name === 'ValidationError') {
      // Throwing a custom error lets the global error handler manage the response
      throw new AppError(
        `Parcel creation failed due to validation errors: ${error.message}`,
        400 // Bad Request
      );
    }

    // For other types of errors, throw a generic server error
    throw new AppError(
      'An unexpected error occurred while creating the parcel.',
      500 // Internal Server Error
    );
  }
};

/**
 * Get a parcel by its tracking ID (parcelId).
 * @param {string} parcelId - The tracking ID of the parcel.
 * @returns {Promise<ServiceResponse<IParcel>>}
 */
export const getParcelById = async (
  parcelId: string
): Promise<ServiceResponse<IParcel>> => {
  try {
    const parcel = await Parcel.findOne({ parcelId });
    if (!parcel) {
      return {
        success: false,
        error: { message: 'Parcel not found' },
      };
    }
    return {
      success: true,
      data: parcel,
    };
  } catch (error: any) {
    logger.error(`Error fetching parcel by ID: ${error.message}`, {
      error,
      parcelId,
    });
    throw new AppError(
      'An unexpected error occurred while fetching the parcel.',
      500
    );
  }
};

/**
 * Update the status of a parcel by its tracking ID.
 * @param {string} parcelId - The tracking ID of the parcel.
 * @param {string} status - The new status to set.
 * @param {string} updatedBy - The user ID performing the update.
 * @returns {Promise<ServiceResponse<IParcel>>}
 */
// export const updateParcelStatus = async (
//   parcelId: string,
//   status: string,
//   updatedBy: string
// ): Promise<ServiceResponse<IParcel>> => {
//   try {
//     const parcel = await Parcel.findOneAndUpdate(
//       { parcelId },
//       { status, updatedAt: new Date() },
//       { new: true }
//     );
//     if (!parcel) {
//       return {
//         success: false,
//         error: { message: 'Parcel not found' },
//       };
//     }
//     logger.info(
//       `Parcel status updated: ${parcelId} → ${status} by ${updatedBy}`
//     );
//     return {
//       success: true,
//       data: parcel,
//     };
//   } catch (error: any) {
//     logger.error(`Error updating parcel status: ${error.message}`, {
//       error,
//       parcelId,
//       status,
//       updatedBy,
//     });
//     throw new AppError(
//       'An unexpected error occurred while updating the parcel status.',
//       500
//     );
//   }
// };

/**
 * Update a parcel (admin: all fields, agent: status only).
 * @param {string} parcelId - The tracking ID of the parcel.
 * @param {object} updateData - The fields to update.
 * @param {string} updatedBy - The user ID performing the update.
 * @param {string} userRole - The role of the user.
 * @returns {Promise<ServiceResponse<IParcel>>}
 */
export const updateParcel = async (
  parcelId: string,
  updateData: Partial<IParcel>,
  updatedBy: string,
  userRole: string
): Promise<ServiceResponse<IParcel>> => {
  try {
    let allowedFields: string[] = [];
    if (userRole === 'admin') {
      // Admin can update all fields except _id, parcelId, sender, createdAt
      allowedFields = [
        'assignedAgent',
        'pickupAddress',
        'deliveryAddress',
        'receiverName',
        'receiverNumber',
        'parcelType',
        'parcelSize',
        'paymentType',
        'codAmount',
        'status',
        'qrCode',
      ];
    } else if (userRole === 'agent') {
      allowedFields = ['status', 'coordinates'];
    } else {
      throw new Error(
        'Forbidden: You do not have permission to update parcels.'
      );
    }

    // Only pick allowed fields from updateData
    const update: any = {};
    for (const key of allowedFields) {
      const typedKey = key as keyof IParcel;
      if (updateData[typedKey] !== undefined)
        update[key] = updateData[typedKey];
      // If assignedAgent is being updated, also set status to 'Assigned'
      if (key === 'assignedAgent' && updateData[typedKey]) {
        update['status'] = 'Assigned';
      }
    }

    const parcel = await Parcel.findOneAndUpdate(
      { parcelId },
      { $set: update },
      { new: true }
    );
    if (!parcel) {
      return {
        success: false,
        error: { message: 'Parcel not found' },
      };
    }
    logger.info(`Parcel updated: ${parcelId} by ${updatedBy} (${userRole})`);

    // 2. After a successful update, emit the event
    getIO().emit('parcel:updated', parcel);
    logger.info(`Parcel updated: ${parcelId} and event emitted.`);

    if (
      userRole === 'agent' &&
      update.status === 'Picked Up' &&
      update.coordinates
    ) {
      try {
        await Tracking.create({
          parcel: parcel.parcelId,
          coordinates: update.coordinates,
        });
        logger.info(`Tracking started for parcel: ${parcel.parcelId}`);
      } catch (trackingError) {
        logger.error(
          `Failed to create initial tracking entry for parcel ${parcel.parcelId}:`,
          trackingError
        );
        // Decide if you want to throw an error or just log it.
        // For now, we'll log it so the parcel update doesn't fail.
      }
    }

    return {
      success: true,
      data: parcel,
    };
  } catch (error: any) {
    logger.error(`Error updating parcel: ${error.message}`, {
      error,
      parcelId,
      updateData,
      updatedBy,
      userRole,
    });
    throw new AppError(
      'An unexpected error occurred while updating the parcel.',
      500
    );
  }
};

/**
 * List parcels with role-based filtering.
 * @param {string} userId - The ID of the requesting user.
 * @param {string} userRole - The role of the requesting user.
 * @returns {Promise<ServiceResponse<IParcel[]>>}
 */
export const listParcels = async (
  userId: string,
  userRole: string
): Promise<ServiceResponse<IParcel[]>> => {
  try {
    let filter = {};
    if (userRole === 'customer') {
      filter = { sender: userId };
    } else if (userRole === 'agent') {
      filter = { assignedAgent: userId };
    }
    // admin: no filter (see all)
    const parcels = await Parcel.find(filter).sort({ createdAt: -1 });
    return {
      success: true,
      data: parcels,
    };
  } catch (error: any) {
    logger.error(`Error listing parcels: ${error.message}`, {
      error,
      userId,
      userRole,
    });
    throw new AppError(
      'An unexpected error occurred while listing parcels.',
      500
    );
  }
};

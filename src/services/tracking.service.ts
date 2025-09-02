// src/services/tracking.service.ts

import { Parcel } from '@models/parcel.model';
import { Tracking } from '@models/tracking.model';
import { logger } from '@utils/logger';
import { AppError } from '@utils/errorHandler';
import { PublicTrackingInfo, TrackingPoint } from 'types/tracking.types';
import { getIO } from '../config/socket';

/**
 * Adds a new tracking point for a parcel.
 * @param parcelId The parcel's tracking ID.
 * @param coordinates The coordinates object { lat, lng }.
 * @returns The newly created tracking document.
 */
// export const addTrackingPoint = async (
//   parcelId: string,
//   coordinates: { lat: number; lng: number }
// ) => {
//   // Transform the incoming data into the required GeoJSON format
//   const geoJsonPoint = {
//     type: 'Point' as const, // Use 'as const' for strict typing
//     coordinates: [coordinates.lng, coordinates.lat], // [longitude, latitude]
//   };

//   // Save the correctly formatted GeoJSON point to the database
//   const newTrackingPoint = await Tracking.create({
//     parcel: parcelId,
//     coordinates: geoJsonPoint,
//   });

//   // 2. Count the total number of tracking points for this parcel
//   const count = await Tracking.countDocuments({ parcel: parcelId });

//   // 3. If the count is greater than 10, find and delete the oldest one
//   if (count > 10) {
//     // Find the single oldest document by sorting by timestamp in ascending order
//     const oldestPoint = await Tracking.findOne({ parcel: parcelId }).sort({ timestamp: 1 });

//     if (oldestPoint) {
//       await Tracking.deleteOne({ _id: oldestPoint._id });
//     }
//   }

//   return newTrackingPoint;
// };
export const addTrackingPoint = async (
  parcelId: string,
  coordinates: { lat: number; lng: number },
  agentId: string
) => {
  try {
    if (!parcelId) {
      logger.warn(
        `Agent ${agentId} sent a location update without a parcel ID.`
      );
      return { message: 'Parcel ID is required.' };
    }

    // 1. Find all parcels assigned to this agent with an active status.
    const activeParcels = await Parcel.find({
      assignedAgent: agentId,
      status: { $in: ['Assigned', 'Picked Up', 'In Transit'] },
    }).select('parcelId'); // We only need the public parcelId for the tracking collection

    // If the agent has no active parcels, there's nothing to do.
    if (activeParcels.length === 0) {
      logger.info(
        `Agent ${agentId} sent a location update, but has no active parcels.`
      );
      return { message: 'No active parcels to update.' };
    }

    // 2. Prepare the data for the update.
    const geoJsonPoint = {
      type: 'Point' as const,
      coordinates: [coordinates.lng, coordinates.lat],
    };
    const parcelIds = activeParcels.map((p) => p.parcelId);

    // --- THIS IS THE FIX ---
    // 3. Create an array of update promises, one for each parcel.
    const updatePromises = parcelIds.map((parcelId) =>
      Tracking.findOneAndUpdate(
        { parcel: parcelId }, // The filter to find the document
        {
          // The data to set
          $set: {
            coordinates: geoJsonPoint,
            timestamp: new Date(),
          },
        },
        { upsert: true, new: true } // Upsert ensures creation if not found
      )
    );

    // 4. Execute all the updates concurrently.
    await Promise.all(updatePromises);
    // ----------------------

    // 4. (Optional but recommended) Emit a single event for all updated parcels
    // This is more efficient than sending one event per parcel.
    getIO().emit('bulk-tracking:updated', {
      agentId,
      coordinates,
      updatedParcels: parcelIds,
    });

    logger.info(
      `Updated location for ${parcelIds.length} parcels for agent ${agentId}.`
    );
    return { message: `Location updated for ${parcelIds.length} parcels.` };
  } catch (error) {
    logger.error(`Error adding tracking point for agent ${agentId}:`, error);
    throw new AppError(
      'An error occurred while adding the tracking point.',
      500
    );
  }
};

/**
 * Fetches all relevant tracking information for a given parcelId.
 */
export const getTrackingInfo = async (
  parcelId: string
): Promise<{ success: boolean; data: PublicTrackingInfo }> => {
  try {
    const parcel = await Parcel.findOne({ parcelId })
      .select(
        'parcelId status assignedAgent pickupAddress deliveryAddress createdAt updatedAt'
      )
      .populate('assignedAgent', 'customerName phone');

    if (!parcel) {
      throw new AppError('No parcel found with this tracking ID', 404);
    }

    const trackingHistory = await Tracking.find({ parcel: parcelId }).sort({
      timestamp: 1,
    });

    const formattedHistory: TrackingPoint[] = trackingHistory
      .filter((t) => t.coordinates && t.coordinates.coordinates)
      .map((t) => ({
        coordinates: {
          lng: t.coordinates.coordinates[0],
          lat: t.coordinates.coordinates[1],
        },
        timestamp: t.timestamp,
      }));

    const responseData: PublicTrackingInfo = {
      parcelId: parcel.parcelId,
      status: parcel.status,
      assignedAgent: parcel.assignedAgent,
      pickupAddress: parcel.pickupAddress,
      deliveryAddress: parcel.deliveryAddress,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
      trackingHistory: formattedHistory, // Use the correctly formatted history
    };

    return { success: true, data: responseData };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Error fetching tracking info for parcel ${parcelId}:`, error);
    throw new AppError(
      'An error occurred while fetching tracking information.',
      500
    );
  }
};

// New service function to get all latest locations
export const getLiveTrackingData = async () => {
  try {
    // 1. Find all parcels that are currently in an active state
    const activeParcels = await Parcel.find({
      status: { $in: ['Picked Up', 'In Transit'] },
    })
      .select('parcelId status assignedAgent')
      .populate('assignedAgent', 'customerName phone');

    if (activeParcels.length === 0) {
      throw new AppError('No active parcels found.', 404);
    }

    // 2. For each active parcel, find its most recent tracking point
    const liveData = await Promise.all(
      activeParcels.map(async (parcel) => {
        const lastPoint = await Tracking.findOne({
          parcel: parcel.parcelId,
        }).sort({ timestamp: -1 }); // Get the latest one

        return {
          ...parcel.toObject(),
          coordinates: lastPoint ? lastPoint.coordinates : null,
        };
      })
    );

    // 3. Filter out any parcels that have no location data yet
    const filteredData = liveData.filter((p) => p.coordinates);
    return filteredData;
  } catch (error) {
    logger.error('Error fetching live tracking data:', error);
    throw new AppError(
      'An error occurred while fetching live tracking data.',
      500
    );
  }
};

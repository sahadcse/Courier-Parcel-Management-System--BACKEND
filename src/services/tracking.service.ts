// src/services/tracking.service.ts

import { Parcel } from '../models/parcel.model';
import { Tracking } from '../models/tracking.model';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errorHandler';
import { PublicTrackingInfo, TrackingPoint } from '../types/tracking.types';
import { getIO } from '../config/socket';

/**
 * Adds a new tracking point for all active parcels assigned to the given agent.
 * If the agent has no active parcels, no tracking points are added.
 * @param parcelId - The public parcel ID (not used in current logic)
 * @param coordinates - The new coordinates { lat, lng }
 * @param agentId - The ID of the agent sending the update
 * @returns A message indicating the result of the operation
 */
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

    // 1. Find all active parcels assigned to this agent
    const activeParcels = await Parcel.find({
      assignedAgent: agentId,
      status: { $in: ['Assigned', 'Picked Up', 'In Transit'] },
    }).select('parcelId');

    // If the agent has no active parcels, there's nothing to do.
    if (activeParcels.length === 0) {
      logger.info(
        `Agent ${agentId} sent a location update, but has no active parcels.`
      );
      return { message: 'No active parcels to update.' };
    }

    // 2. Prepare the GeoJSON point
    const geoJsonPoint = {
      type: 'Point' as const,
      coordinates: [coordinates.lng, coordinates.lat],
    };
    const parcelIds = activeParcels.map((p) => p.parcelId);

    // 3. Create or update tracking points for each active parcel
    const updatePromises = parcelIds.map((parcelId) =>
      Tracking.findOneAndUpdate(
        { parcel: parcelId },
        {
          // Upsert the tracking point
          $set: {
            coordinates: geoJsonPoint,
            timestamp: new Date(),
          },
        },
        // Create if not exists, return the new document
        { upsert: true, new: true } 
      )
    );

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // 4. Emit a Socket.IO event to notify clients of the bulk update 
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
 * Fetches tracking information for a specific parcel.
 * @param {string} parcelId - The public parcel ID to fetch tracking info for.
 * @returns {Promise<{ success: boolean; data: PublicTrackingInfo }>} A promise that resolves to an object containing a success flag and the tracking information.
 * @throws {AppError} If the parcel is not found or if there is an error fetching the data.
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
      trackingHistory: formattedHistory, // Include the formatted tracking history
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

/** Fetches live tracking data for all parcels currently in transit.
 * @returns {Promise<any[]>} A promise that resolves to an array of parcels with their latest tracking coordinates.
 * @throws {AppError} If there is an error fetching the data.
 */
export const getLiveTrackingData = async () => {
  try {
    // 1. Find all parcels that are currently in transit
    const activeParcels = await Parcel.find({
      status: { $in: ['Picked Up', 'In Transit'] },
    })
      .select('parcelId status assignedAgent')
      .populate('assignedAgent', 'customerName phone');

    if (activeParcels.length === 0) {
      throw new AppError('No active parcels found.', 404);
    }

    //  2. For each active parcel, get the latest tracking point
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

    //  3. Filter out parcels without tracking data
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

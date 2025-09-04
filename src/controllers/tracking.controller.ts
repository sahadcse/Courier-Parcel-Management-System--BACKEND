// # Real-time tracking (get/update coordinates)

// src/controllers/tracking.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as trackingService from '../services/tracking.service';
import { logger } from '../utils/logger';
import { getIO } from '../config/socket';

/**
 * Request to get tracking information for a parcel.
 */
export const getTrackingInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { parcelId } = req.params;
    const result = await trackingService.getTrackingInfo(parcelId);

    logger.info(`Tracking information retrieved for parcel: ${parcelId}`);
    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for agent to post a location update.
 */
export const postTrackingUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { parcelId, coordinates } = req.body;
    const id = req.user?.id || '';
    if (!id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const newTrackingPoint = await trackingService.addTrackingPoint(
      parcelId,
      coordinates,
      id
    );

    // Broadcast the update via Socket.IO
    getIO().emit('tracking:updated', { parcelId, coordinates });

    res.status(201).json({ success: true, data: newTrackingPoint });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch live tracking data for all parcels.
 * This endpoint fetches the latest tracking data for all parcels.
 * Returns the latest tracking data for all parcels.
*/
export const getLiveTrackingData = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const liveData = await trackingService.getLiveTrackingData();
    res.status(200).json({
      success: true,
      data: liveData,
      message: 'Live tracking data retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

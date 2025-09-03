// parcel.controller.ts
// # Parcel CRUD operations (create, update, delete, get)

import { Request, Response, NextFunction } from 'express';
import * as parcelService from '../services/parcel.service';
import { logger } from '../utils/logger';

export const createParcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    // To ensure user exists before proceeding
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const parcel = await parcelService.createParcel(req.body, userId);
    logger.info(`Parcel created: ${parcel.data?.parcelId}`);
    res.status(201).json({ success: true, data: parcel });
  } catch (error) {
    next(error);
    return;
  }
  // Add a fallback response to ensure all code paths return
  return;
};

// GET /parcels/:id → Get parcel by tracking ID
export const getParcelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcelId = req.params.parcelId;
    const result = await parcelService.getParcelById(parcelId);

    if (!result.success || !result.data) {
      return res
        .status(404)
        .json({ success: false, message: 'Parcel not found' });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    next(error);
    return;
  }
  return;
};

// PATCH /parcels/:parcelId → Update (admin: all fields, agent: status only)
export const updateParcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcelId = req.params.parcelId;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updateData = req.body;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await parcelService.updateParcel(
      parcelId,
      updateData,
      userId,
      userRole
    );

    if (!result.success || !result.data) {
      return res
        .status(404)
        .json({
          success: false,
          message: result.error?.message || 'Parcel not found',
        });
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    next(error);
    return;
  }
  return;
};

// GET /parcels/all → List parcels (role-based filtering)
export const listParcels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await parcelService.listParcels(userId, userRole);

    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    next(error);
    return;
  }
  return;
};

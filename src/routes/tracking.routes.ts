// src/routes/tracking.routes.ts

import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import * as trackingController from '../controllers/tracking.controller';
import { getTrackingInfoSchema } from '../validation/tracking.validation';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /v1/track
 * @desc    Endpoint for an agent to post a location update
 * @access  Private (Agent)
 */
router.post(
  '/',
  authMiddleware(['agent']),
  trackingController.postTrackingUpdate
);

/**
 * @route   GET /v1/track/live
 * @desc    Get live tracking data for all active parcels
 * @access  Private (Admin)
 */
router.get(
  '/live',
  authMiddleware(['admin']),
  trackingController.getLiveTrackingData
);

/**
 * @route   GET /v1/track/:parcelId
 * @desc    Get public tracking information and history for a single parcel
 * @access  Public
 */
router.get(
  '/:parcelId',
  validate(getTrackingInfoSchema),
  trackingController.getTrackingInfo
);

export default router;

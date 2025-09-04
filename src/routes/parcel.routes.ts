// # Parcel API endpoints (/parcels, /parcels/:id)

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import * as parcelController from '../controllers/parcel.controller';
import {
  parcelCreateSchema,
  parcelGetSchema,
  parcelUpdateSchema,
  parcelAdminUpdateSchema,
} from '../validation/parcel.validation';

const router = Router();

/**
 * @route   POST /api/v1/parcels/create
 * @desc    Create a new parcel booking (Customer, Admin)
 * @access  Private (Customer, Admin)
 */
router.post(
  '/create',
  authMiddleware(['customer', 'admin']),
  validate(parcelCreateSchema),
  parcelController.createParcel
);

/**
 * @route   GET /api/v1/parcels/all
 * @desc    Get all parcels (Customer, Admin, Agent)
 * @access  Private (Customer, Admin, Agent)
 */
router.get(
  '/all',
  authMiddleware(['customer', 'admin', 'agent']),
  parcelController.listParcels
);


/** * @route   PATCH /api/v1/parcels/:parcelId
 * @desc    Update parcel details (Agent, Admin)
 * @access  Private (Agent, Admin)
 */
router.patch(
  '/:parcelId',
  authMiddleware(['agent', 'admin']),
  (req, res, next) => {
    // Use different validation for admin vs agent
    if (req.user?.role === 'admin') {
      return validate(parcelAdminUpdateSchema)(req, res, next);
    }
    return validate(parcelUpdateSchema)(req, res, next);
  },
  parcelController.updateParcel
);

/**
 * @route   GET /api/v1/parcels/:parcelId
 * @desc    Get parcel by tracking ID (Customer, Admin, Agent)
 * @access  Private (Customer, Admin, Agent)
 */
router.get(
  '/:parcelId',
  authMiddleware(['customer', 'admin', 'agent']),
  validate(parcelGetSchema),
  parcelController.getParcelById
);

export default router;

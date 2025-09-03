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

// POST /v1/parcels/create → Create booking (customer)
router.post(
  '/create',
  authMiddleware(['customer', 'admin']),
  validate(parcelCreateSchema),
  parcelController.createParcel
);

// GET /v1/parcels/all → List parcels (role-based filtering)
router.get(
  '/all',
  authMiddleware(['customer', 'admin', 'agent']),
  parcelController.listParcels
);


// PATCH /v1/parcels/:parcelId → Update status (agent, admin)
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

// GET /v1/parcels/:parcelId → Get parcel by tracking ID (customer, admin, agent)
router.get(
  '/:parcelId',
  authMiddleware(['customer', 'admin', 'agent']),
  validate(parcelGetSchema),
  parcelController.getParcelById
);

export default router;

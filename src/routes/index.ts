// # Combine and export all routes// src/routes/index.ts
import { Router } from 'express';
import authRoutes from '../routes/auth.routes';
import parcelRoutes from '../routes/parcel.routes';
import agentRoutes from '../routes/agent.routes';
import adminRoutes from '../routes/admin.routes';
import trackingRoutes from '../routes/tracking.routes';
// import transactionRoutes from '../routes/transaction.routes';
import healthRoutes from '../routes/health.routes';
import debugRoutes from './debug.routes';

const router = Router();

// Mount all routes

router.use('/v1/auth', authRoutes);
router.use('/v1/parcels', parcelRoutes);
router.use('/v1/agent', agentRoutes);
router.use('/v1/admin', adminRoutes);
router.use('/v1/track', trackingRoutes);
router.use('/v1/debug', debugRoutes);
// router.use('/v1/transactions', transactionRoutes);
router.use('/v1/health', healthRoutes); // Mount health routes at /v1/health

export default router;
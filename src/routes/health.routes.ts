// src/routes/health.routes.ts
import { Router } from 'express';
import { healthCheck } from '@controllers/health.controller';

const router = Router();

/**
 * Health check route
 * @route GET /api/v1/health/check
 * @group Health - Operations about health checks
 * @returns {object} 200 - success response
 * @returns {Error}  500 - internal server error
 */
router.get('/check', healthCheck);

export default router;
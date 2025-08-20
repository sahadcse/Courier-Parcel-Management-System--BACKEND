// src/routes/health.routes.ts
import { Router } from 'express';
import { healthCheck } from '@controllers/health.controller';

const router = Router();

// Health check route
router.get('/check', healthCheck);

export default router;
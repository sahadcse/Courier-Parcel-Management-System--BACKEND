// src/controllers/health.controller.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Interface for health check response
interface HealthCheckResponse {
  status: string;
  mongodb: string;
  timestamp: string;
}

// Health check endpoint logic
export const healthCheck = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const healthStatus: HealthCheckResponse = {
      status: 'healthy',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };

    logger.info(`Health check requested: ${JSON.stringify(healthStatus)}`);
    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error(`Health check error: ${(error as Error).message}`);
    next(error);
  }
};
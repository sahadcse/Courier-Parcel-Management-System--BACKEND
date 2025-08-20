// # Centralized error handling

// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${error.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
  next();
};
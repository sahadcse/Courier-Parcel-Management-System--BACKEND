// # Admin-specific logic (dashboard metrics, assign agents)

// src/controllers/admin.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as userService from '@services/admin.service';
import { logger } from '@utils/logger';

/**
 * Controller to handle fetching all users.
 */
export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();

    logger.info('Successfully retrieved all users for an admin request.');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    // Pass errors to the global error handler
    next(error);
  }
};


export const getDashboardAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const analytics = await userService.getDashboardAnalytics();

    logger.info('Successfully retrieved dashboard analytics for an admin request.');
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    // Pass errors to the global error handler
    next(error);
  }
};
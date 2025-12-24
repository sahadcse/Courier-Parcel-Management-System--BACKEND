// # Centralized error handling

// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { HttpError, ValidationError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { NODE_ENV } from '../config/env';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    status: number;
    errors?: { field: string; message: string }[];
    stack?: string;
    timestamp: string;
  };
}

/**
 * Error handling middleware
 * @param error - The error object
 * @param req - The request object
 * @param res - The response object
 * @param _next - The next middleware function
 * @returns 
 */
export const errorMiddleware = (
  error: Error | HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ValidationError) {
    const status = error.status;
    const message = error.message;

    logger.warn(`${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
      error: error,
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message,
        status,
        errors: error.details,
        timestamp: new Date().toISOString(),
      },
    };
    if (NODE_ENV === 'development') {
      errorResponse.error.stack = error.stack;
    }

    res.status(status).json(errorResponse);
    return;
  }


  let status = 500;
  let message = 'Internal Server Error';

  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  }

  // Log error with request context
  // Determine log level based on status code
  if (status >= 500) {
    logger.error(
      `${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
      {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      }
    );
  } else {
    // Log client errors (4xx) as warnings to avoid cluttering error logs
    logger.warn(
      `${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
    },
  };

  // Include stack trace in development
  if (NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  res.status(status).json(errorResponse);
};


/**
 * Middleware to handle 404 Not Found errors
 * @param req - The request object
 * @param res - The response object
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(`404 - ${message} - ${req.method} - ${req.ip}`);

  res.status(404).json({
    success: false,
    error: {
      message,
      status: 404,
      timestamp: new Date().toISOString(),
    },
  });
};

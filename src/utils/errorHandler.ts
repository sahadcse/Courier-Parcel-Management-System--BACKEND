// # Custom error classes and utilities
// src/utils/errorHandler.ts

/**
 * Custom Error Classes
 * - HttpError: Base class for HTTP errors
 * - AppError: General application error
 */
export class HttpError extends Error {
  status: number;
  isOperational: boolean;

  constructor(status: number, message: string, isOperational = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * AppError: General application error
 * - Inherits from HttpError
 * - Default status code is 500
 */
export class AppError extends HttpError {
  constructor(message: string, status = 500) {
    super(status, message);
    this.name = 'AppError';
  }
}

/**
 * ValidationError: Error for validation failures
 * - Inherits from HttpError
 * - Default status code is 400
 */
export class ValidationError extends HttpError {
  public details?: { field: string; message: string }[];
  constructor(message: string, details?: { field: string; message: string }[]) {
    super(400, message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/** Other specific error classes can be added here as needed
 * e.g., AuthenticationError, AuthorizationError, NotFoundError, etc.
 */
export class AuthenticationError extends HttpError {
  constructor(message = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

/**
 * AuthorizationError: Error for authorization failures
 * - Inherits from HttpError
 * - Default status code is 403
 */
export class AuthorizationError extends HttpError {
  constructor(message = 'Access denied') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

/**
 * NotFoundError: Error for resource not found
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

/**
 * ConflictError: Error for resource conflicts
 */
export class ConflictError extends HttpError {
  constructor(message = 'Resource conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

/**
 * DatabaseError: Error for database operation failures
 */
export class DatabaseError extends HttpError {
  constructor(message = 'Database operation failed') {
    super(500, message, false);
    this.name = 'DatabaseError';
  }
}

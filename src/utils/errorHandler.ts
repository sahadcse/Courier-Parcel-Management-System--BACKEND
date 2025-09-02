// # Custom error classes and utilities

// src/utils/errorHandler.ts
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

export class AppError extends HttpError {
  constructor(message: string, status = 500) {
    super(status, message);
    this.name = 'AppError';
  }
}

export class ValidationError extends HttpError {
  public details?: { field: string; message: string }[];
  constructor(message: string, details?: { field: string; message: string }[]) {
    super(400, message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class AuthenticationError extends HttpError {
  constructor(message = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends HttpError {
  constructor(message = 'Access denied') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Resource conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends HttpError {
  constructor(message = 'Database operation failed') {
    super(500, message, false);
    this.name = 'DatabaseError';
  }
}

// # JWT authentication and RBAC middleware

// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthenticationError, AuthorizationError } from '../utils/errorHandler';
import { UserPayload } from '../types/auth.types';
import { verifyAccessToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';
// import { verifyToken } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authMiddleware = (
  allowedRoles: Array<'admin' | 'agent' | 'customer'> = []
) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token =
        req.cookies.accessToken ||
        req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        logger.warn(`Authentication failed: No token provided - ${req.ip}`);
        throw new AuthenticationError('No token provided');
      }

      let decoded: UserPayload;
      try {
        decoded = verifyAccessToken(token);
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return next(new AuthenticationError('Token expired'));
        } else if (error instanceof jwt.JsonWebTokenError) {
          return next(new AuthenticationError('Invalid token'));
        }
        return next(error);
      }
      req.user = decoded;

      // RBAC: Check if user is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        logger.warn(
          `Authorization failed: User ${decoded.email} with role ${decoded.role} attempted to access restricted resource`
        );
        throw new AuthorizationError('Insufficient permissions');
      }

      logger.info(`User authenticated: ${decoded.email} - ${req.originalUrl}`);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        req.user = verifyAccessToken(token);
      } catch {
      }
    }

    next();
  } catch {
    next();
  }
};

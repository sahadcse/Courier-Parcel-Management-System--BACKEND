import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from './../config/env';
import { UserPayload } from 'types/auth.types';

// Signs an Access Token (short-lived)
export const signAccessToken = (payload: UserPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

// Verifies an Access Token
export const verifyAccessToken = (token: string): UserPayload => {
  // like TokenExpiredError bubble up to the middleware that calls this.
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as UserPayload;
};

// Signs a Refresh Token (long-lived)
export const signRefreshToken = (payload: UserPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

// Verifies a Refresh Token
export const verifyRefreshToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as UserPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

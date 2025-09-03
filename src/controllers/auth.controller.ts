// # Auth-related logic (register, login, refresh token)

// src/controllers/auth.controller.ts
import { Request, Response, NextFunction, CookieOptions } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { NODE_ENV, REGISTER_KEY_ADMIN } from '../config/env';
import {
  signAccessToken,
  verifyRefreshToken,
  signRefreshToken,
} from '../utils/jwt';
import { UserPayload } from '../types/auth.types';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await loginUser({
      email,
      password,
    });

    // Set JWT in HttpOnly cookie for security
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production' ? true : false,
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 2 * 60 * 1000, // 2 Minutes
    });

    // Set Refresh Token in HttpOnly cookie for security
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production' ? true : false,
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken: NODE_ENV === 'development' ? accessToken : undefined,
        refreshToken: NODE_ENV === 'development' ? refreshToken : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie) {
      return res.status(401).send('Access denied. No refresh token provided.');
    }

    // Verify the refresh token using the correct secret
    const decoded = verifyRefreshToken(tokenFromCookie);

    const payload: UserPayload = {
      id: decoded.id,
      customerName: decoded.customerName,
      email: decoded.email,
      role: decoded.role,
      isActive: decoded.isActive,
    };

    // Issue a new access token
    const newAccessToken = signAccessToken(payload);
    // Issue a new refresh token for rotation
    const newRefreshToken = signRefreshToken(payload);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production' ? true : false,
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production' ? true : false,
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: 'Token refreshed successfully' });
  } catch (error) {
    // If the refresh token is invalid, clear both cookies for security
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    // Clear both the access token and the refresh token cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerName, email, password, role, phone, address } = req.body;
    const user = await registerUser({
      customerName,
      email,
      password,
      role,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.body.registerKey !== REGISTER_KEY_ADMIN) {
    res.status(403).json({
      success: false,
      message: 'You are not allowed to register an admin user',
      statusCode: 403,
    });
    return;
  }
  req.body.role ?? (req.body.role = undefined);
  req.body.role = 'admin';
  await register(req, res, next);
};

export const registerAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  req.body.role ?? (req.body.role = undefined);
  req.body.role = 'agent';
  await register(req, res, next);
};

export const registerCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  req.body.role ?? (req.body.role = undefined);
  req.body.role = 'customer';
  await register(req, res, next);
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // user is attached by auth middleware
    const user = req.user;
    res.status(200).json({
      success: true,
      data: { user },
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

// # Auth business logic (JWT, bcrypt, user creation)

// src/services/auth.service.ts
import bcryptjs from 'bcryptjs';
import { User } from '../models/index';
import { logger } from '../utils/logger';
import {
  ConflictError,
  AuthenticationError,
  DatabaseError,
} from '../utils/errorHandler';
import {
  RegisterInput,
  LoginInput,
  UserPayload,
  AuthResponse,
  UserResponse,
} from 'types/auth.types';
import { BCRYPT_ROUNDS } from '../config/env';
import { signAccessToken,  signRefreshToken } from '../utils/jwt';

export const registerUser = async (
  input: RegisterInput
): Promise<UserResponse> => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: input.email }, { phone: input.phone }],
    });

    if (existingUser) {
      const field = existingUser.email === input.email ? 'email' : 'phone';
      throw new ConflictError(`User with this ${field} already exists`);
    }

    // Hash password with configured rounds
    const hashedPassword = await bcryptjs.hash(input.password, BCRYPT_ROUNDS);


    // Create new user
    const user = new User({
      ...input,
      password: hashedPassword,
      isActive: input.role === 'customer' || input.role === 'admin' ? true : false,
    });

    await user.save();

    logger.info(`User registered successfully: ${user.email}`);

    return {
      _id: user._id.toString(),
      customerName: user.customerName,
      email: user.email,
      role: user.role,
      phone: user.phone || undefined,
      address: user.address || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    logger.error(`Registration error: ${(error as Error).message}`);
    throw new DatabaseError('Registration failed');
  }
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  try {
    // Find user and include password for verification
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user || !(await bcryptjs.compare(input.password, user.password))) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT
    const payload: UserPayload = {
      id: user._id.toString(),
      customerName: user.customerName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    // Use the correct signing functions
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user: {
        _id: user._id.toString(),
        customerName: user.customerName,
        email: user.email,
        role: user.role,
        phone: user.phone || undefined,
        address: user.address || undefined,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    logger.error(`Login error: ${(error as Error).message}`);
    throw new DatabaseError('Login failed');
  }
};

// export const verifyToken = (token: string): UserPayload => {
//   try {
//     return verifyJwt(token);
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       throw new AuthenticationError('Token expired');
//     }
//     throw new AuthenticationError('Invalid token');
//   }
// };

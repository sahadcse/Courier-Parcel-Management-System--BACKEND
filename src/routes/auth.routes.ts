// # Auth API endpoints 
// src/routes/auth.routes.ts

import { Router } from 'express';
import { registerCustomer, registerAdmin, registerAgent, login, logout, me, refreshToken } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validation/auth.validation';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Register a new user
 * @route POST /api/v1/auth/register/customer
 * @group Auth - Operations about user authentication
 * @param {RegisterInput} user.body.required - user information
 * @returns {object} 201 - success response
 * @returns {Error} 400 - validation error
 * @returns {Error} 409 - user already exists
 */
router.post('/register/customer', validate(registerSchema), registerCustomer);

/**
 * Register a new admin
 * @route POST /api/v1/auth/register/admin
 * @group Auth - Operations about user authentication
 * @param {RegisterInput} user.body.required - user information
 * @returns {object} 201 - success response
 * @returns {Error} 400 - validation error
 * @returns {Error} 409 - user already exists
 */
router.post('/register/admin', validate(registerSchema), registerAdmin);

/**
 * Register a new agent
 * @route POST /api/v1/auth/register/agent
 * @group Auth - Operations about user authentication
 * @param {RegisterInput} user.body.required - user information
 * @returns {object} 201 - success response
 * @returns {Error} 400 - validation error
 * @returns {Error} 409 - user already exists
 */
router.post('/register/agent', validate(registerSchema), registerAgent);

/**
 * Login an existing user
 * @route POST /api/v1/auth/login
 * @group Auth - Operations about user authentication
 * @param {LoginInput} credentials.body.required - user credentials
 * @returns {object} 200 - success response with token
 * @returns {Error} 400 - validation error
 * @returns {Error} 401 - invalid credentials
 */
router.post('/login', validate(loginSchema), login);

/**
 * Generate a New Token
 * @route POST /api/v1/auth/refresh
 * @group Auth - Operations about Token Generator
 * @param {Access Token} cookie.accesstoken.required - Cookie Token
 * @returns {object} 200 - success response with token
 * @returns {Error} 400 - Token error
 */
router.post('/refresh', refreshToken);


/**
 * Logout the current user
 * @route POST /api/v1/auth/logout
 * @group Auth - Operations about user authentication
 * @returns {object} 200 - success response
 */
router.post('/logout', logout);

/**
 * Get current authenticated user
 * @route GET /api/v1/auth/me
 * @group Auth - Operations about user authentication
 * @returns {object} 200 - user info
 * @returns {Error} 401 - unauthorized
 */
router.get('/me', authMiddleware(['admin', 'agent', 'customer']), me);

export default router;

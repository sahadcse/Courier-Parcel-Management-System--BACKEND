// src/routes/debug.routes.ts
import { Router, Request, Response } from 'express';
import { REGISTER_KEY_ADMIN } from '../config/env';

const router = Router();

/**
 * @route   GET /api/v1/debug-env
 * @desc    Log environment variables to server console (Protected by secret key)
 * @access  Private (Requires secret key as query parameter)
 */
router.get('/debug-env', (req: Request, res: Response) => {
  if (req.query.secret !== REGISTER_KEY_ADMIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  console.log('--- DEBUGGING ENVIRONMENT VARIABLES ---');
  console.log(process.env);
  console.log('------------------------------------');
  
  return res.status(200).json({
    message: 'Environment variables logged on the server. Checking the Render logs.',
    NODE_ENV: process.env.NODE_ENV,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    DB_URI_IS_SET: !!process.env.DB_URI,
  });
});

export default router;

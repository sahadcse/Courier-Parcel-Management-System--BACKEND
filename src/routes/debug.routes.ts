// src/routes/debug.routes.ts
import { Router, Request, Response } from 'express';
import { REGISTER_KEY_ADMIN } from '../config/env';

const router = Router();

router.get('/debug-env', (req: Request, res: Response) => {
  // Protect this route with your admin registration key
  if (req.query.secret !== REGISTER_KEY_ADMIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  console.log('--- DEBUGGING ENVIRONMENT VARIABLES ---');
  console.log(process.env);
  console.log('------------------------------------');
  
  res.status(200).json({
    message: 'Environment variables logged on the server. Check your Render logs.',
    // Be careful not to expose all variables in the response for security
    NODE_ENV: process.env.NODE_ENV,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    DB_URI_IS_SET: !!process.env.DB_URI,
  });
});

export default router;
// # Main Express app setup (middleware, routes, Socket.IO)

// ADD THESE LINES AT THE VERY TOP OF THE FILE
process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('FATAL: Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1); // It's generally recommended to exit on uncaught exceptions
});
// END OF NEW LINES


// src/app.ts
import express, { Request, Response } from 'express';
import http from 'http';
import { initSocket } from './config/socket';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { xss } from 'express-xss-sanitizer';
import connectDB from './config/database';
import routes from './routes/index';
import { logger } from './utils/logger';
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middlewares/error.middleware';
import { CORS_ORIGIN, NODE_ENV, PORT } from './config/env';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'connect-src': ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5000'],
      },
    },
  })
);
app.disable('x-powered-by'); // Disable X-Powered-By header for security
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 5000, // limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Input sanitization middleware
app.use(mongoSanitize());
app.use(xss()); // Prevents XSS by sanitizing all string inputs

// Compression middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Request logging in development
if (NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// API routes

// Health check fallback
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Courier & Parcel Management System API',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

// 404 handler
app.use(notFoundMiddleware);

// Error handling middleware (must be last)
app.use(errorMiddleware);

const httpServer = http.createServer(app);
initSocket(httpServer);

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
  } catch (error) {
    logger.error(`Server startup error: ${(error as Error).message}`);
    process.exit(1);
  }
};

startServer();

export default app;

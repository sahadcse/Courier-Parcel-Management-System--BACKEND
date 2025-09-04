// # Main Express app setup (middleware, routes, Socket.IO)
// src/app.ts

// ADDED FOR BETTER ERROR HANDLING
process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
  //  Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('FATAL: Uncaught Exception:', error);
  //  Application specific logging, cleanup or other logic here
  process.exit(1); // Mandatory (as per the Node.js docs)
});


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

// Trust proxy if behind a reverse proxy (Render)
app.set('trust proxy', 1);

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

// Hide Express usage
app.disable('x-powered-by'); 


// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 60 : 5000, // limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss()); 

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

// Development logging
if (NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}


// API routes
// Health check route
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

// Global error handler
app.use(errorMiddleware);

const httpServer = http.createServer(app);
initSocket(httpServer);

// Start server and connect to DB
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

// Start the server
startServer();

export default app;

// # Winston logger setup for logging
// src/utils/logger.ts

import winston from 'winston';
import { LOG_LEVEL, NODE_ENV } from '../config/env';

/**
 * Winston Logger Configuration
 * - Logs to console in development with colorized output
 * - Logs to files in production (error.log and combined.log)
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

/**
 * Console log format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

/**
 * Winston transports configuration
 * - Console transport for all environments
 * - File transports for production (error.log and combined.log)
 */
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: NODE_ENV === 'development' ? consoleFormat : logFormat,
  }),
];

/**
 * File transports for production environment
 * - error.log for error level logs
 * - combined.log for all logs
 * - Log rotation can be added with additional packages if needed
 */
if (NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Winston Logger Instance
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Integrate with Application Insights if connection string is provided (Ex: Render)
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  // Add Render-specific logging integration here if needed
  logger.info('Application Insights logging enabled');
}

export { logger };

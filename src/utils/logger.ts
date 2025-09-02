// # Winston logger setup for logging
// src/utils/logger.ts

import winston from 'winston';
import { LOG_LEVEL, NODE_ENV } from '@config/env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: NODE_ENV === 'development' ? consoleFormat : logFormat,
  }),
];

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

// Integrate with Azure Application Insights (optional, as per plan)
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  // Add Azure Application Insights transport (requires `applicationinsights` package)
  // Example: logger.add(new AzureApplicationInsightsTransport());
}

export { logger };

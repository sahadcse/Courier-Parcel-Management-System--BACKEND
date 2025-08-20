// # Winston logger setup for logging
// src/utils/logger.ts

import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console(),
    // File transport for production logs
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Integrate with Azure Application Insights (optional, as per plan)
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  // Add Azure Application Insights transport (requires `applicationinsights` package)
  // Example: logger.add(new AzureApplicationInsightsTransport());
}

export { logger };
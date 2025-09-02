// # MongoDB Atlas connection setup (Mongoose)

// src/config/database.ts
import mongoose from 'mongoose';
import { logger } from '@utils/logger';
import { DB_URI, NODE_ENV } from '@config/env';
import { DatabaseError } from '@utils/errorHandler';

// Connect
if (!DB_URI) {
  logger.error('DB_URI is not defined in environment variables');
  process.exit(1); // Exit process if URI is missing
}

// MongoDB connection function
const connectDB = async (): Promise<void> => {
  try {
    // Configure Mongoose connection options
    const options: mongoose.ConnectOptions = {
      maxPoolSize: NODE_ENV === 'production' ? 20 : 10, // Connection pool size based on environment
      serverSelectionTimeoutMS: 10000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket inactivity
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true, // Enable retryable writes
      w: 'majority', // Write concern
    };

    // Connect to MongoDB Atlas
    await mongoose.connect(DB_URI, options);
    logger.info('MongoDB Atlas connected successfully');

    // Event listeners for connection status
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connection established');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose connection disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err.message}`);
      throw new DatabaseError(`Database connection error: ${err.message}`);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose reconnected');
    });

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (error) {
        logger.error(
          `Error closing MongoDB connection: ${(error as Error).message}`
        );
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error(
      `Failed to connect to MongoDB Atlas: ${(error as Error).message}`
    );
    throw new DatabaseError(
      `Database connection failed: ${(error as Error).message}`
    );
  }
};

export default connectDB;

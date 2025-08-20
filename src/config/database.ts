// # MongoDB Atlas connection setup (Mongoose)

// src/config/database.ts
import mongoose from 'mongoose';
import { logger } from '@utils/logger'; // Winston logger from utils
import { DB_URI } from "./env";

// Connect
if (!DB_URI) {
  logger.error('DB_URI is not defined in .env file');
  process.exit(1); // Exit process if URI is missing
}

// MongoDB connection function
const connectDB = async (): Promise<void> => {
  try {
    // Configure Mongoose connection options
    const options = {
      autoIndex: true, // Automatically create indexes defined in schemas
      maxPoolSize: 10, // Connection pool size for scalability
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket inactivity
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
    });

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Failed to connect to MongoDB Atlas: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;

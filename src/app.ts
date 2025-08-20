// # Main Express app setup (middleware, routes, Socket.IO)

// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from '@config/database';
import routes from '@routes/index';
import { logger } from '@utils/logger';
import { errorMiddleware } from '@middlewares/error.middleware';

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // Adjust origin as per plan
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware (assumed to exist)
app.use(errorMiddleware);

// Health check fallback (optional, for root path)
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Courier & Parcel Management System API' });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB Atlas
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Server startup error: ${(error as Error).message}`);
    process.exit(1);
  }
};

startServer();

export default app;
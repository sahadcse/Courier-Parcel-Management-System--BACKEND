import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './../utils/jwt';
import cookie from 'cookie';

// Extend the Socket interface to include a 'user' property
declare module 'socket.io' {
  interface Socket {
    user?: any;
  }
}

let io: Server;
const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
      credentials: true,
    },
  });

  console.log('Socket.IO initialized');

  io.use((socket, next) => {
    try {
      const handshake = socket.handshake;

      if (!handshake.headers.cookie) {
        return next(new Error('Authentication error: No cookies provided.'));
      }

      // Parse cookies from the header
      const cookies = cookie.parse(handshake.headers.cookie);
      const accessToken = cookies.accessToken;

      if (!accessToken) {
        return next(
          new Error('Authentication error: No access token provided.')
        );
      }

      // Verify the access token
      const decodedPayload = verifyAccessToken(accessToken);

      socket.user = decodedPayload;

      next();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Socket authentication failed:', error.message);
      } else {
        console.error('Socket authentication failed:', error);
      }
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    socket.on('registerUser', (userId: string) => {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }

      console.log('User disconnected:', socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

// 3. New function to get a specific user's socket ID
export const getUserSocketId = (userId: string) => {
  return userSocketMap.get(userId);
};

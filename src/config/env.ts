// # Environment variable setup (dotenv)
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const DB_URI = process.env.DB_URI || 'your_mongodb_uri';

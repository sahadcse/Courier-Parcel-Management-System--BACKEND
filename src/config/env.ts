// # Environment variable setup (dotenv)
import dotenv from 'dotenv';
import { type StringValue } from 'ms';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DB_URI: string;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: StringValue;
  // JWT_REFRESH_EXPIRES_IN: StringValue;
  CORS_ORIGIN: string;
  BCRYPT_ROUNDS: number;
  LOG_LEVEL: string;
  REGISTER_KEY_ADMIN: string;
  REFRESH_TOKEN_SECRET: StringValue;
  REFRESH_TOKEN_EXPIRES_IN: StringValue;
}

const getEnvConfig = (): EnvConfig => {
  const requiredEnvVars = ['DB_URI', 'ACCESS_TOKEN_SECRET'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    DB_URI: process.env.DB_URI!,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    ACCESS_TOKEN_EXPIRES_IN: (process.env.ACCESS_TOKEN_EXPIRES_IN || '1h') as StringValue,
    // JWT_REFRESH_EXPIRES_IN: (process.env.JWT_REFRESH_EXPIRES_IN ||
    //   '1d') as StringValue,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    REGISTER_KEY_ADMIN: process.env.REGISTER_KEY_ADMIN || 'itisunknown',
    REFRESH_TOKEN_SECRET: (process.env.REFRESH_TOKEN_SECRET || 'itisunknownalso') as StringValue,
    REFRESH_TOKEN_EXPIRES_IN: (process.env.REFRESH_TOKEN_EXPIRES_IN || '2d') as StringValue,
  };
};

export const envConfig = getEnvConfig();
export const {
  NODE_ENV,
  PORT,
  DB_URI,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  // JWT_REFRESH_EXPIRES_IN,
  CORS_ORIGIN,
  BCRYPT_ROUNDS,
  LOG_LEVEL,
  REGISTER_KEY_ADMIN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} = envConfig;

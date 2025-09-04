// Interfaces for auth (User, Token)

export interface User {
  _id: string;
  customerName: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'customer';
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPayload {
  id: string;
  customerName: string;
  email: string;
  isActive: boolean;
  role: 'admin' | 'agent' | 'customer';
  iat?: number;
  exp?: number;
}

export interface RegisterInput {
  customerName: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'customer';
  phone?: string;
  address?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface JWTConfig {
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
}

// Helper type for user responses without password
export interface UserResponse {
  _id: string;
  customerName: string;
  email: string;
  role: 'admin' | 'agent' | 'customer';
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

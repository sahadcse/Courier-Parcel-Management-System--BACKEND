// # Integration tests for auth routes

// src/tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../app';
import { User } from '@models/user.model';

describe('Auth API', () => {
  beforeAll(async () => {
    await User.deleteMany({}); // Clear test database
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'customer',
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  it('should login a user and set JWT cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
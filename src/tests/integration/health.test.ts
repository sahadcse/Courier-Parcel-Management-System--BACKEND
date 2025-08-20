// src/tests/integration/health.test.ts
import request from 'supertest';
import app from '../../app';

describe('Health Check API', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/v1/health/check');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('mongodb');
    expect(res.body).toHaveProperty('timestamp');
  });
});
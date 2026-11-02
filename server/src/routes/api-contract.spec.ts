import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';

describe('End-to-End API Response Contract Integration Tests', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('1. Health check should return 200 with standard SuccessResponse', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', true);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('payload');
    expect(res.body.payload).toMatchObject({
      status: 'ok',
      service: expect.any(String),
      version: expect.any(String),
    });
  });

  it('2. Unmatched route should return 404 with standard ErrorResponse', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint-test');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: false,
      code: 404,
      message: 'Cannot GET /api/v1/unknown-endpoint-test',
    });
  });

  it('3. Protected route without auth token should return 401 with standard ErrorResponse', async () => {
    const res = await request(app).get('/api/v1/patients');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: false,
      code: 401,
      message: 'Authentication token missing or invalid',
    });
  });

  it('4. POST /auth/login with missing credentials should return 422 validation error with path errors', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      status: false,
      code: 422,
      message: 'Validation failed',
      errors: [
        { path: 'username', message: 'Username is required' },
        { path: 'password', message: 'Password is required' },
      ],
    });
  });

  it('5. POST /auth/refresh with missing token should return 422 with path error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      status: false,
      code: 422,
      message: 'Validation failed',
      errors: [
        { path: 'refreshToken', message: 'refreshToken is required' },
      ],
    });
  });
});

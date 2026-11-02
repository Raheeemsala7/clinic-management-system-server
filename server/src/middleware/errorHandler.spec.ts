import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { errorHandler } from './errorHandler';
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../utils/errors';

describe('Centralized Error Handler Specification', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Test routes throwing various errors
    app.get('/test/validation-error', () => {
      throw new ValidationError('Validation failed', [
        { path: 'email', message: 'Invalid email address' },
        { path: 'password', message: 'Password must be at least 8 characters' },
      ]);
    });

    app.get('/test/mongoose-validation', () => {
      const mongooseError: any = new Error('Validation failed');
      mongooseError.name = 'ValidationError';
      mongooseError.errors = {
        gender: { path: 'gender', message: '`OTHER` is not a valid enum value for path `gender`.' },
        phone: { path: 'phone', message: 'Path `phone` is required.' },
      };
      throw mongooseError;
    });

    app.get('/test/cast-error', () => {
      const castError: any = new Error('Cast to ObjectId failed');
      castError.name = 'CastError';
      castError.path = 'patientId';
      throw castError;
    });

    app.get('/test/duplicate-key', () => {
      const dupError: any = new Error('E11000 duplicate key error');
      dupError.code = 11000;
      dupError.keyValue = { username: 'doctor1' };
      throw dupError;
    });

    app.get('/test/unauthorized', () => {
      throw new UnauthorizedError('Authentication token missing or invalid');
    });

    app.get('/test/forbidden', () => {
      throw new ForbiddenError('You do not have permission to access this resource');
    });

    app.get('/test/not-found', () => {
      throw new NotFoundError('Patient not found');
    });

    app.get('/test/bad-request', () => {
      throw new BadRequestError('Invalid filter query parameter');
    });

    app.get('/test/unexpected', () => {
      throw new Error('Database connection unexpectedly dropped with stack trace details');
    });

    app.use(errorHandler);
  });

  it('1. should return 422 with normalized errors array for ValidationError', async () => {
    const res = await request(app).get('/test/validation-error');

    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      status: false,
      code: 422,
      message: 'Validation failed',
      errors: [
        { path: 'email', message: 'Invalid email address' },
        { path: 'password', message: 'Password must be at least 8 characters' },
      ],
    });
  });

  it('2. should return 422 with normalized errors for Mongoose Schema ValidationError', async () => {
    const res = await request(app).get('/test/mongoose-validation');

    expect(res.status).toBe(422);
    expect(res.body.status).toBe(false);
    expect(res.body.code).toBe(422);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        { path: 'gender', message: '`OTHER` is not a valid enum value for path `gender`.' },
        { path: 'phone', message: 'Path `phone` is required.' },
      ]),
    );
  });

  it('3. should return 422 with path for Mongoose CastError', async () => {
    const res = await request(app).get('/test/cast-error');

    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      status: false,
      code: 422,
      message: 'Validation failed',
      errors: [
        { path: 'patientId', message: 'Invalid format for field patientId' },
      ],
    });
  });

  it('4. should return 409 Conflict for Mongoose duplicate key', async () => {
    const res = await request(app).get('/test/duplicate-key');

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      status: false,
      code: 409,
      message: 'A username with this value already exists',
    });
  });

  it('5. should return 401 Unauthorized for UnauthorizedError', async () => {
    const res = await request(app).get('/test/unauthorized');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: false,
      code: 401,
      message: 'Authentication token missing or invalid',
    });
  });

  it('6. should return 403 Forbidden for ForbiddenError', async () => {
    const res = await request(app).get('/test/forbidden');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      status: false,
      code: 403,
      message: 'You do not have permission to access this resource',
    });
  });

  it('7. should return 404 Not Found for NotFoundError', async () => {
    const res = await request(app).get('/test/not-found');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: false,
      code: 404,
      message: 'Patient not found',
    });
  });

  it('8. should return 400 Bad Request for BadRequestError', async () => {
    const res = await request(app).get('/test/bad-request');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: false,
      code: 400,
      message: 'Invalid filter query parameter',
    });
  });

  it('9. should return 500 and not expose internal error or stack traces for unexpected errors', async () => {
    // Silence console.error for this expected test error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/test/unexpected');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: false,
      code: 500,
      message: 'Internal server error',
    });
    expect(res.body.stack).toBeUndefined();
    expect(res.body.details).toBeUndefined();

    spy.mockRestore();
  });
});


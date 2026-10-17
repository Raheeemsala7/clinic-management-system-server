import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './db/connection';
import { errorHandler } from './middleware/errorHandler';

import apiRouter from './routes';

dotenv.config();

const app = express();

// Security and utility middlewares
app.use(helmet({ contentSecurityPolicy: false }));

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-side Next.js fetch)
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive CORS
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB is connected for every request (critical for serverless / cold starts)
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Health check endpoints
app.get(['/', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Clinic Management API (Express + MongoDB)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Central API Router
app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;

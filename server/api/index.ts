import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

let cachedServer: Express | null = null;

async function bootstrapServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn', 'log'],
  });

  app.use(helmet());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Server Actions, server-side fetch, mobile, curl)
      if (!origin) return callback(null, true);

      // Support local dev
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      // Support Vercel domains (*.vercel.app)
      if (/\.vercel\.app$/.test(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api/v1');

  try {
    await app.init();
    cachedServer = expressApp;
    return cachedServer;
  } catch (error) {
    console.error('NestJS app.init() failed:', error);
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    const server = await bootstrapServer();
    return server(req, res);
  } catch (error: any) {
    console.error('Serverless function invocation error:', error);
    return res.status(500).json({
      error: {
        code: 'FUNCTION_INVOCATION_FAILED',
        message: error?.message || 'Serverless function failed to initialize',
        details: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
      },
    });
  }
}

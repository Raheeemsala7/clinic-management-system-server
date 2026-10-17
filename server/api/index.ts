import { Request, Response } from 'express';
import app from '../src/app';
import { connectDB } from '../src/db/connection';

export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error: any) {
    console.error('Serverless function invocation error:', error);
    return res.status(500).json({
      error: {
        code: 'FUNCTION_INVOCATION_FAILED',
        message: error?.message || 'Serverless function failed to connect or execute',
        details: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
      },
    });
  }
}

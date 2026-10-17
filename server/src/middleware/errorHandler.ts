import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
    details = err.errors;
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A resource with this key already exists';
    details = err.keyValue;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid format for field ${err.path}`;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Malformed JSON in request body';
  } else if (err.statusCode || err.status) {
    statusCode = err.statusCode || err.status;
    code = err.code || 'ERROR';
    message = err.message || 'Request failed';
  } else {
    console.error(`[Unhandled Error] on ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  });
}

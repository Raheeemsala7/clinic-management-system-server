import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { errorResponse, FieldError } from '../utils/response';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: FieldError[] | undefined = undefined;

  // 1. Explicit Domain ValidationError
  if (err instanceof ValidationError) {
    statusCode = err.statusCode || 422;
    message = err.message || 'Validation failed';
    errors = err.errors;
  }
  // 2. Mongoose Schema Validation Error
  else if (err.name === 'ValidationError' && err.errors && typeof err.errors === 'object') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.keys(err.errors).map((key) => {
      const field = err.errors[key];
      return {
        path: field.path || key,
        message: field.message || `Invalid value for ${key}`,
      };
    });
  }
  // 3. Joi Validation Error (if err.isJoi or err.details is array)
  else if (err.isJoi || (err.name === 'ValidationError' && Array.isArray(err.details))) {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.details.map((detail: any) => ({
      path: Array.isArray(detail.path) ? detail.path.join('.') : String(detail.path || ''),
      message: detail.message.replace(/['"]/g, ''),
    }));
  }
  // 4. Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = [
      {
        path: err.path || 'id',
        message: `Invalid format for field ${err.path || 'id'}`,
      },
    ];
  }
  // 5. Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 409;
    const duplicateKey = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'resource';
    message = `A ${duplicateKey} with this value already exists`;
  }
  // 6. JSON Parse Failure in Body
  else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }
  // 7. General Domain AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    if (Array.isArray(err.details)) {
      errors = err.details as FieldError[];
    }
  }
  // 8. Other HTTP errors with status
  else if (typeof err.statusCode === 'number' || typeof err.status === 'number') {
    statusCode = err.statusCode || err.status;
    message = err.message || 'Request failed';
  }
  // 9. Unhandled internal errors
  else {
    console.error(`[Unhandled Error] on ${req.method} ${req.originalUrl || req.url}:`, err);
    statusCode = 500;
    message = 'Internal server error';
  }

  res.status(statusCode).json(
    errorResponse({
      code: statusCode,
      message,
      errors,
    }),
  );
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        // Already formatted error from our code
        if (resp['error']) {
          response.status(status).json(exceptionResponse);
          return;
        }
        // NestJS built-in validation errors
        if (resp['message']) {
          code = this.statusToCode(status);
          message = Array.isArray(resp['message'])
            ? 'Validation failed'
            : (resp['message'] as string);
          details = Array.isArray(resp['message']) ? resp['message'] : undefined;
        }
      } else if (typeof exceptionResponse === 'string') {
        code = this.statusToCode(status);
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      // Don't leak stack traces in production
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error(`Unhandled error on ${request.method} ${request.url}`, exception.stack);
      } else {
        this.logger.error(`Unhandled error on ${request.method} ${request.url}: ${exception.message}`);
      }
    }

    const body: ErrorResponse = {
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
    };

    response.status(status).json(body);
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] ?? 'ERROR';
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Business rule violation — maps to 409 Conflict or 422 Unprocessable Entity.
 * All business exceptions carry a machine-readable `code` field.
 */
export class BusinessException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus = HttpStatus.CONFLICT,
    details?: unknown,
  ) {
    super(
      {
        error: {
          code,
          message,
          ...(details !== undefined && { details }),
        },
      },
      status,
    );
  }
}

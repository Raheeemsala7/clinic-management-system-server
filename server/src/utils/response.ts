import { Response } from 'express';

export type MetadataData = {
  page: string;
  limit: string;
  total: string;
  totalPages: string;
  summary?: any;
};

export type SuccessResponse<T> = {
  status: true;
  code: number;
  message?: string;
  payload: T;
  metadata?: MetadataData;
};

export type FieldError = {
  path: string;
  message: string;
};

export type ErrorResponse = {
  status: false;
  code: number;
  message?: string;
  errors?: FieldError[];
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface PaginatedSource<T> {
  data: T[];
  meta: {
    page: number | string;
    pageSize: number | string;
    total: number | string;
    totalPages: number | string;
  };
}

/**
 * Creates a standardized SuccessResponse object conforming to the API contract.
 */
export function successResponse<T>(
  payload: T,
  options?: {
    code?: number;
    message?: string;
    metadata?: MetadataData;
  },
): SuccessResponse<T> {
  const code = options?.code ?? 200;
  const response: SuccessResponse<T> = {
    status: true,
    code,
    payload,
  };

  if (options?.message) {
    response.message = options.message;
  }

  if (options?.metadata) {
    response.metadata = options.metadata;
  }

  return response;
}

/**
 * Creates a standardized ErrorResponse object conforming to the API contract.
 */
export function errorResponse(options: {
  code: number;
  message?: string;
  errors?: FieldError[];
}): ErrorResponse {
  const response: ErrorResponse = {
    status: false,
    code: options.code,
    message: options.message || 'An error occurred',
  };

  if (options.errors && options.errors.length > 0) {
    response.errors = options.errors;
  }

  return response;
}

/**
 * Sends a standardized success JSON response through Express.
 */
export function sendSuccess<T>(
  res: Response,
  payload: T,
  options?: {
    code?: number;
    message?: string;
    metadata?: MetadataData;
  },
): void {
  const code = options?.code ?? 200;
  res.status(code).json(successResponse(payload, options));
}

/**
 * Sends a standardized paginated response by unwrapping { data, meta }
 * into { status: true, code: 200, payload: data, metadata: { page, limit, total, totalPages } }.
 */
export function sendPaginated<T>(
  res: Response,
  paginated: PaginatedSource<T>,
  options?: {
    code?: number;
    message?: string;
  },
): void {
  const metadata: MetadataData = {
    page: String(paginated.meta.page),
    limit: String(paginated.meta.pageSize),
    total: String(paginated.meta.total),
    totalPages: String(paginated.meta.totalPages),
  };

  if ((paginated as any).summary) {
    metadata.summary = (paginated as any).summary;
  }

  sendSuccess(res, paginated.data, {
    code: options?.code ?? 200,
    message: options?.message,
    metadata,
  });
}

/**
 * Sends an explicit HTTP 204 No Content response without a body.
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}


import {
  successResponse,
  errorResponse,
  sendSuccess,
  sendPaginated,
  sendNoContent,
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
} from './response';
import { Response } from 'express';

describe('Standardized API Response Utilities', () => {
  describe('successResponse', () => {
    it('should generate a standard 200 success response envelope', () => {
      const payload = { id: '123', name: 'Dr. Smith' };
      const res = successResponse(payload);

      expect(res).toEqual({
        status: true,
        code: 200,
        payload: { id: '123', name: 'Dr. Smith' },
      });
    });

    it('should support custom HTTP status code and message', () => {
      const payload = { id: 'patient-1' };
      const res = successResponse(payload, { code: 201, message: 'Patient created' });

      expect(res).toEqual({
        status: true,
        code: 201,
        message: 'Patient created',
        payload: { id: 'patient-1' },
      });
    });

    it('should include string-based pagination metadata when provided', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const metadata = {
        page: '1',
        limit: '20',
        total: '100',
        totalPages: '5',
      };
      const res = successResponse(items, { metadata });

      expect(res).toEqual({
        status: true,
        code: 200,
        payload: items,
        metadata: {
          page: '1',
          limit: '20',
          total: '100',
          totalPages: '5',
        },
      });
    });
  });

  describe('errorResponse', () => {
    it('should generate a standard error response envelope', () => {
      const res = errorResponse({ code: 404, message: 'Resource not found' });

      expect(res).toEqual({
        status: false,
        code: 404,
        message: 'Resource not found',
      });
      expect(res.errors).toBeUndefined();
    });

    it('should include field-level errors when provided', () => {
      const errors = [
        { path: 'email', message: 'Invalid email' },
        { path: 'password', message: 'Too short' },
      ];
      const res = errorResponse({ code: 422, message: 'Validation failed', errors });

      expect(res).toEqual({
        status: false,
        code: 422,
        message: 'Validation failed',
        errors: [
          { path: 'email', message: 'Invalid email' },
          { path: 'password', message: 'Too short' },
        ],
      });
    });
  });

  describe('Express Helpers', () => {
    let mockRes: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let sendMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      sendMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: sendMock });
      mockRes = {
        status: statusMock,
      };
    });

    it('sendSuccess should call res.status and res.json with standardized payload', () => {
      sendSuccess(mockRes as Response, { data: 'test' }, { code: 201, message: 'Created' });

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        status: true,
        code: 201,
        message: 'Created',
        payload: { data: 'test' },
      });
    });

    it('sendPaginated should transform numeric pagination into string metadata', () => {
      const paginatedSource = {
        data: [{ id: 'a' }, { id: 'b' }],
        meta: {
          page: 2,
          pageSize: 10,
          total: 55,
          totalPages: 6,
        },
      };

      sendPaginated(mockRes as Response, paginatedSource);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: true,
        code: 200,
        payload: [{ id: 'a' }, { id: 'b' }],
        metadata: {
          page: '2',
          limit: '10',
          total: '55',
          totalPages: '6',
        },
      });
    });

    it('sendNoContent should send 204 with empty body', () => {
      sendNoContent(mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalledWith();
      expect(jsonMock).not.toHaveBeenCalled();
    });
  });

  describe('Type Discriminant Validation', () => {
    it('should discriminate ApiResponse union based on boolean status', () => {
      const success: ApiResponse<{ id: string }> = successResponse({ id: '123' });
      const failure: ApiResponse<{ id: string }> = errorResponse({ code: 400, message: 'Bad request' });

      if (success.status) {
        expect(success.payload.id).toBe('123');
      } else {
        throw new Error('Expected success');
      }

      if (!failure.status) {
        expect(failure.code).toBe(400);
      } else {
        throw new Error('Expected failure');
      }
    });
  });
});


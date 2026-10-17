import { Request, Response, NextFunction } from 'express';

export type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

/**
 * Wraps async controller methods to catch unhandled rejections
 * and automatically forward them to Express error handler.
 */
export function asyncHandler(fn: AsyncController) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

import { Request, Response, NextFunction } from 'express';

export const uploadMiddleware = {
  single: () => (_req: Request, _res: Response, next: NextFunction) => next(),
  array: () => (_req: Request, _res: Response, next: NextFunction) => next(),
};

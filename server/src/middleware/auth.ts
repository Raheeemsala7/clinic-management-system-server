import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface AuthUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTION';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }

    const user = await User.findById(payload.sub);
    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedError('User account not found or inactive');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRoles(...roles: Array<'ADMIN' | 'DOCTOR' | 'RECEPTION'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}

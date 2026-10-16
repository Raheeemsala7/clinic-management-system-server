import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;   // userId
  username: string;
  role: Role;
  iat?: number;
  exp?: number;
}

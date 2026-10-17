import * as crypto from 'crypto';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateToken(bytes = 40): string {
  return crypto.randomBytes(bytes).toString('hex');
}

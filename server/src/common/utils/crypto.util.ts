import * as crypto from 'crypto';

/**
 * Creates a SHA-256 hex hash of the given value.
 * Used for hashing refresh tokens before storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a cryptographically random token of `bytes` length, returned as hex.
 */
export function generateToken(bytes = 40): string {
  return crypto.randomBytes(bytes).toString('hex');
}

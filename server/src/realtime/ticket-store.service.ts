import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Role } from '@prisma/client';

export interface TicketPayload {
  userId: string;
  username: string;
  role: Role;
  expiresAt: number; // unix ms
}

/**
 * In-memory single-use ticket store for Socket.IO browser connections.
 *
 * Why in-memory?
 *  - Tickets expire in 30 s; no persistence needed.
 *  - For multi-instance deployments, replace Map with Redis SETNX+EXPIRE.
 *    Record decision D-019.
 *
 * Tickets are random 32-byte hex strings — unpredictable enough that
 * guessing is computationally infeasible within the 30-second window.
 */
@Injectable()
export class TicketStoreService {
  private readonly logger = new Logger(TicketStoreService.name);
  private readonly store = new Map<string, TicketPayload>();
  /** TTL in milliseconds */
  private readonly TTL_MS = 30_000;
  /** Run cleanup every 60 s to avoid memory leaks */
  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupInterval = setInterval(() => this.purgeExpired(), 60_000);
    // Allow the process to exit even if this interval is active
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  /** Create a new single-use ticket for the given user. */
  issue(userId: string, username: string, role: Role): { ticket: string; expiresInSeconds: number } {
    const ticket = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + this.TTL_MS;
    this.store.set(ticket, { userId, username, role, expiresAt });
    return { ticket, expiresInSeconds: this.TTL_MS / 1000 };
  }

  /**
   * Consume a ticket — returns the payload if valid, null otherwise.
   * The ticket is deleted immediately on first successful use.
   */
  consume(ticket: string): TicketPayload | null {
    const entry = this.store.get(ticket);
    if (!entry) return null;
    // Always delete — whether expired or not — to prevent replay
    this.store.delete(ticket);
    if (Date.now() > entry.expiresAt) {
      this.logger.debug(`Ticket expired: ${ticket.substring(0, 8)}…`);
      return null;
    }
    return entry;
  }

  private purgeExpired() {
    const now = Date.now();
    for (const [ticket, payload] of this.store.entries()) {
      if (now > payload.expiresAt) this.store.delete(ticket);
    }
  }
}

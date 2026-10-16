import { TicketStoreService } from './ticket-store.service';
import { Role } from '@prisma/client';

describe('TicketStoreService', () => {
  let store: TicketStoreService;

  beforeEach(() => {
    store = new TicketStoreService();
  });

  it('issues a ticket and returns ticket + expiresInSeconds', () => {
    const result = store.issue('user-1', 'alice', Role.ADMIN);
    expect(result.ticket).toBeTruthy();
    expect(result.ticket).toHaveLength(64); // 32 bytes hex
    expect(result.expiresInSeconds).toBe(30);
  });

  it('consumes a valid ticket and returns the payload', () => {
    const { ticket } = store.issue('user-1', 'alice', Role.ADMIN);
    const payload = store.consume(ticket);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe('user-1');
    expect(payload?.username).toBe('alice');
    expect(payload?.role).toBe(Role.ADMIN);
  });

  it('ticket can only be consumed once (single-use)', () => {
    const { ticket } = store.issue('user-1', 'alice', Role.DOCTOR);
    const first = store.consume(ticket);
    const second = store.consume(ticket);
    expect(first).not.toBeNull();
    expect(second).toBeNull(); // already consumed
  });

  it('returns null for an unknown ticket', () => {
    expect(store.consume('not-a-real-ticket')).toBeNull();
  });

  it('returns null for an expired ticket', () => {
    const { ticket } = store.issue('user-1', 'alice', Role.RECEPTION);
    // Manually expire by manipulating internal store
    // Access via casting since it's a private Map
    const internal = (store as unknown as { store: Map<string, { expiresAt: number }> }).store;
    const entry = internal.get(ticket)!;
    entry.expiresAt = Date.now() - 1; // already in the past
    expect(store.consume(ticket)).toBeNull();
  });

  it('different users get different tickets', () => {
    const a = store.issue('user-1', 'alice', Role.ADMIN);
    const b = store.issue('user-2', 'bob', Role.DOCTOR);
    expect(a.ticket).not.toBe(b.ticket);
  });

  it('two tickets for the same user are different', () => {
    const a = store.issue('user-1', 'alice', Role.ADMIN);
    const b = store.issue('user-1', 'alice', Role.ADMIN);
    expect(a.ticket).not.toBe(b.ticket);
  });
});

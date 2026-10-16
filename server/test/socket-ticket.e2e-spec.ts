/**
 * E2E tests: Socket.IO ticket issuance and enforcement.
 *
 * These tests only use supertest to hit REST endpoints and verify the
 * ticket lifecycle without actually connecting a Socket.IO client,
 * keeping the test suite fast and dependency-free.
 */
import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { TicketStoreService } from 'src/realtime/ticket-store.service';
import { createTestApp, seedTestUsers } from './helpers/test-app.helper';

describe('Socket Ticket (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ticketStore: TicketStoreService;
  let adminToken: string;
  let doctorToken: string;
  let receptionToken: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    ({ app, prisma } = await createTestApp());
    await seedTestUsers(prisma);
    ticketStore = app.get(TicketStoreService);

    // Login all three roles
    const loginAs = async (username: string, password: string): Promise<string> => {
      const res = await supertest(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ username, password });
      return (res.body as { accessToken: string }).accessToken;
    };

    [adminToken, doctorToken, receptionToken] = await Promise.all([
      loginAs('test_admin_e2e', 'TestAdmin@123'),
      loginAs('test_doctor_e2e', 'TestDoctor@123'),
      loginAs('test_recept_e2e', 'TestRecept@123'),
    ]);
  }, 60000);

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  const BASE = '/api/v1';

  // ── Issuance ──────────────────────────────────────────────────────────────

  it('returns a ticket and expiresInSeconds for ADMIN', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(typeof (res.body as { ticket: string }).ticket).toBe('string');
    expect((res.body as { ticket: string }).ticket).toHaveLength(64);
    expect((res.body as { expiresInSeconds: number }).expiresInSeconds).toBe(30);
  });

  it('returns a ticket for DOCTOR', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`)
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect((res.body as { ticket: string }).ticket).toHaveLength(64);
  });

  it('returns a ticket for RECEPTION', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`)
      .set('Authorization', `Bearer ${receptionToken}`);
    expect(res.status).toBe(200);
    expect((res.body as { ticket: string }).ticket).toHaveLength(64);
  });

  it('returns 401 without authentication', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`);
    expect(res.status).toBe(401);
  });

  // ── Single-use enforcement (via TicketStoreService directly) ─────────────

  it('ticket can only be consumed once', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`)
      .set('Authorization', `Bearer ${adminToken}`);
    const { ticket } = res.body as { ticket: string };

    const first = ticketStore.consume(ticket);
    const second = ticketStore.consume(ticket);

    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });

  it('expired ticket is rejected', () => {
    const { ticket } = ticketStore.issue('test-user-id', 'test', 'ADMIN');
    // Force expiry
    const internal = (ticketStore as unknown as {
      store: Map<string, { expiresAt: number }>;
    }).store;
    const entry = internal.get(ticket)!;
    entry.expiresAt = Date.now() - 1;

    expect(ticketStore.consume(ticket)).toBeNull();
  });

  it('unknown ticket is rejected', () => {
    expect(ticketStore.consume('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBeNull();
  });

  // ── Each request issues a fresh, unique ticket ────────────────────────────

  it('two consecutive requests produce different tickets', async () => {
    const [res1, res2] = await Promise.all([
      supertest(app.getHttpServer())
        .post(`${BASE}/auth/socket-ticket`)
        .set('Authorization', `Bearer ${doctorToken}`),
      supertest(app.getHttpServer())
        .post(`${BASE}/auth/socket-ticket`)
        .set('Authorization', `Bearer ${doctorToken}`),
    ]);
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect((res1.body as { ticket: string }).ticket).not.toBe(
      (res2.body as { ticket: string }).ticket,
    );
  });

  // ── Role-filtered payloads ────────────────────────────────────────────────
  // Verify that the ticket carries the correct role so the gateway joins
  // the right room (and therefore receives the right filtered events).

  it('ticket issued for DOCTOR carries role DOCTOR', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`)
      .set('Authorization', `Bearer ${doctorToken}`);
    const { ticket } = res.body as { ticket: string };
    const payload = ticketStore.consume(ticket);
    expect(payload?.role).toBe('DOCTOR');
  });

  it('ticket issued for RECEPTION carries role RECEPTION', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`)
      .set('Authorization', `Bearer ${receptionToken}`);
    const { ticket } = res.body as { ticket: string };
    const payload = ticketStore.consume(ticket);
    expect(payload?.role).toBe('RECEPTION');
  });

  it('ticket issued for ADMIN carries role ADMIN', async () => {
    const res = await supertest(app.getHttpServer())
      .post(`${BASE}/auth/socket-ticket`)
      .set('Authorization', `Bearer ${adminToken}`);
    const { ticket } = res.body as { ticket: string };
    const payload = ticketStore.consume(ticket);
    expect(payload?.role).toBe('ADMIN');
  });
});

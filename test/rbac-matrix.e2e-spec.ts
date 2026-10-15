import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { createTestApp, seedTestUsers, getAuthTokens, TestTokens } from './helpers/test-app.helper';

/**
 * RBAC Permission Matrix Test
 *
 * Tests every sensitive endpoint against each role, verifying that:
 * - Forbidden roles receive 403
 * - Allowed roles receive 2xx (or 4xx for validation, not 401/403)
 * - Unauthenticated requests receive 401
 */

describe('RBAC Matrix (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokens: TestTokens;
  let ids: { adminId: string; doctorId: string; receptionId: string };

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    ({ app, prisma } = await createTestApp());
    ids = await seedTestUsers(prisma);
    tokens = await getAuthTokens(app);
  }, 60000);

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  const BASE = '/api/v1';

  function auth(role: keyof TestTokens) {
    return `Bearer ${tokens[role]}`;
  }

  // ─── Helper: verify a route is forbidden for a role ──────────────────────
  async function expectForbidden(method: 'get' | 'post' | 'patch' | 'put' | 'delete', path: string, role: keyof TestTokens) {
    const res = await (request(app.getHttpServer()) as unknown as Record<string, (url: string) => request.Test>)[method](`${BASE}${path}`)
      .set('Authorization', auth(role));
    expect([401, 403]).toContain(res.status);
  }

  async function expectAllowed(method: 'get' | 'post' | 'patch' | 'put' | 'delete', path: string, role: keyof TestTokens) {
    const res = await (request(app.getHttpServer()) as unknown as Record<string, (url: string) => request.Test>)[method](`${BASE}${path}`)
      .set('Authorization', auth(role));
    // Allowed = not 401 and not 403 (could be 400 for missing body, 404 for fake ID, etc.)
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  }

  // ─── Unauthenticated ─────────────────────────────────────────────────────────
  describe('Unauthenticated requests', () => {
    it('GET /patients returns 401', async () => {
      const res = await request(app.getHttpServer()).get(`${BASE}/patients`);
      expect(res.status).toBe(401);
    });

    it('GET /reports/summary returns 401', async () => {
      const res = await request(app.getHttpServer()).get(`${BASE}/reports/summary`);
      expect(res.status).toBe(401);
    });
  });

  // ─── Doctor MUST NOT access financial routes ──────────────────────────────
  describe('Doctor cannot access financial routes', () => {
    it('GET /payments → DOCTOR gets 403', async () => expectForbidden('get', '/payments', 'doctor'));
    it('GET /expenses → DOCTOR gets 403', async () => expectForbidden('get', '/expenses', 'doctor'));
    it('GET /closing/preview → DOCTOR gets 403', async () => expectForbidden('get', '/closing/preview?date=2024-01-01', 'doctor'));
    it('GET /reports/summary → DOCTOR gets 403', async () => expectForbidden('get', '/reports/summary?from=2024-01-01&to=2024-01-31', 'doctor'));
    it('GET /reports/income-by-day → DOCTOR gets 403', async () => expectForbidden('get', '/reports/income-by-day?from=2024-01-01&to=2024-01-31', 'doctor'));
    it('GET /reports/expenses-by-category → DOCTOR gets 403', async () => expectForbidden('get', '/reports/expenses-by-category?from=2024-01-01&to=2024-01-31', 'doctor'));
    it('GET /reports/payments-by-method → DOCTOR gets 403', async () => expectForbidden('get', '/reports/payments-by-method?from=2024-01-01&to=2024-01-31', 'doctor'));
    it('GET /audit-logs → DOCTOR gets 403', async () => expectForbidden('get', '/audit-logs', 'doctor'));
    it('GET /settings → DOCTOR gets 403', async () => expectForbidden('get', '/settings', 'doctor'));
    it('GET /users → DOCTOR gets 403', async () => expectForbidden('get', '/users', 'doctor'));
  });

  // ─── Reception MUST NOT access medical routes ────────────────────────────
  describe('Reception cannot access medical routes', () => {
    it('GET /visits/:id → RECEPTION gets 403', async () => expectForbidden('get', '/visits/fake-id', 'reception'));
    it('GET /prescriptions/:id → RECEPTION gets 403', async () => expectForbidden('get', '/prescriptions/fake-id', 'reception'));
    it('GET /attachments/:id → RECEPTION gets 403', async () => expectForbidden('get', '/attachments/fake-id', 'reception'));
    it('GET /drugs → RECEPTION gets 403', async () => expectForbidden('get', '/drugs', 'reception'));
    it('GET /audit-logs → RECEPTION gets 403', async () => expectForbidden('get', '/audit-logs', 'reception'));
    it('GET /settings → RECEPTION gets 403', async () => expectForbidden('get', '/settings', 'reception'));
    it('GET /users → RECEPTION gets 403', async () => expectForbidden('get', '/users', 'reception'));
    it('GET /reports/summary → RECEPTION gets 403', async () => expectForbidden('get', '/reports/summary?from=2024-01-01&to=2024-01-31', 'reception'));
  });

  // ─── Admin has access to everything ──────────────────────────────────────
  describe('Admin has broad access', () => {
    it('GET /patients → ADMIN gets 2xx', async () => expectAllowed('get', '/patients', 'admin'));
    it('GET /users → ADMIN gets 2xx', async () => expectAllowed('get', '/users', 'admin'));
    it('GET /audit-logs → ADMIN gets 2xx', async () => expectAllowed('get', '/audit-logs', 'admin'));
    it('GET /settings → ADMIN gets 2xx', async () => expectAllowed('get', '/settings', 'admin'));
    it('GET /expense-categories → ADMIN gets 2xx', async () => expectAllowed('get', '/expense-categories', 'admin'));
  });

  // ─── Reception-specific permissions ─────────────────────────────────────
  describe('Reception can access their allowed routes', () => {
    it('GET /patients → RECEPTION gets 2xx', async () => expectAllowed('get', '/patients', 'reception'));
    it('GET /expense-categories → RECEPTION gets 2xx', async () => expectAllowed('get', '/expense-categories', 'reception'));
    it('GET /payments → RECEPTION gets 2xx', async () => expectAllowed('get', '/payments', 'reception'));
  });

  // ─── Doctor-specific permissions ────────────────────────────────────────
  describe('Doctor can access their allowed routes', () => {
    it('GET /patients → DOCTOR gets 2xx', async () => expectAllowed('get', '/patients', 'doctor'));
    it('GET /drugs → DOCTOR gets 2xx', async () => expectAllowed('get', '/drugs', 'doctor'));
  });
});

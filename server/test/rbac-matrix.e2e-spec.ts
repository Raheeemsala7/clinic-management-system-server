import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  createTestApp,
  seedTestUsers,
  getAuthTokens,
  TestTokens,
} from './helpers/test-app.helper';

/**
 * RBAC Permission Matrix (e2e)
 *
 * Covers the spec requirement: "Write an e2e test that iterates a permission
 * matrix (role x endpoint x expected status code)."
 *
 * Conventions:
 *  - Forbidden  → expect 401 (unauthenticated) or 403 (authenticated but wrong role)
 *  - Allowed    → expect NOT 401 AND NOT 403  (200/201/204/400/404 all acceptable)
 */

describe('RBAC Permission Matrix (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokens: TestTokens;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    ({ app, prisma } = await createTestApp());
    await seedTestUsers(prisma);
    tokens = await getAuthTokens(app);
  }, 60000);

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  const BASE = '/api/v1';

  const bearer = (role: keyof TestTokens) => `Bearer ${tokens[role]}`;

  /** Expect the request to be rejected (401 or 403). */
  async function expectForbidden(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    path: string,
    role: keyof TestTokens,
  ) {
    const req = supertest(app.getHttpServer())
      [method](`${BASE}${path}`)
      .set('Authorization', bearer(role));
    const res = await req;
    expect([401, 403]).toContain(res.status);
  }

  /** Expect the request to be accepted (not 401 and not 403). */
  async function expectAllowed(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    path: string,
    role: keyof TestTokens,
  ) {
    const req = supertest(app.getHttpServer())
      [method](`${BASE}${path}`)
      .set('Authorization', bearer(role));
    const res = await req;
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  }

  // ── Unauthenticated ─────────────────────────────────────────────────────
  describe('Unauthenticated requests return 401', () => {
    it('GET /patients → 401', async () => {
      const res = await supertest(app.getHttpServer()).get(`${BASE}/patients`);
      expect(res.status).toBe(401);
    });
    it('GET /reports/summary → 401', async () => {
      const res = await supertest(app.getHttpServer()).get(
        `${BASE}/reports/summary?from=2024-01-01&to=2024-01-31`,
      );
      expect(res.status).toBe(401);
    });
    it('GET /auth/me → 401', async () => {
      const res = await supertest(app.getHttpServer()).get(`${BASE}/auth/me`);
      expect(res.status).toBe(401);
    });
  });

  // ── DOCTOR must NOT access financial routes ──────────────────────────────
  describe('DOCTOR is forbidden on financial routes', () => {
    it('GET /payments', () => expectForbidden('get', '/payments', 'doctor'));
    it('GET /expenses', () => expectForbidden('get', '/expenses', 'doctor'));
    it('GET /closing/preview?date=2024-01-01', () =>
      expectForbidden('get', '/closing/preview?date=2024-01-01', 'doctor'));
    it('GET /reports/summary', () =>
      expectForbidden(
        'get',
        '/reports/summary?from=2024-01-01&to=2024-01-31',
        'doctor',
      ));
    it('GET /reports/income-by-day', () =>
      expectForbidden(
        'get',
        '/reports/income-by-day?from=2024-01-01&to=2024-01-31',
        'doctor',
      ));
    it('GET /reports/expenses-by-category', () =>
      expectForbidden(
        'get',
        '/reports/expenses-by-category?from=2024-01-01&to=2024-01-31',
        'doctor',
      ));
    it('GET /reports/payments-by-method', () =>
      expectForbidden(
        'get',
        '/reports/payments-by-method?from=2024-01-01&to=2024-01-31',
        'doctor',
      ));
    it('GET /audit-logs', () => expectForbidden('get', '/audit-logs', 'doctor'));
    it('GET /settings', () => expectForbidden('get', '/settings', 'doctor'));
    it('GET /users', () => expectForbidden('get', '/users', 'doctor'));
  });

  // ── RECEPTION must NOT access medical routes ─────────────────────────────
  describe('RECEPTION is forbidden on medical routes', () => {
    it('GET /visits/:id', () =>
      expectForbidden('get', '/visits/00000000-0000-0000-0000-000000000000', 'reception'));
    it('GET /prescriptions/:id', () =>
      expectForbidden(
        'get',
        '/prescriptions/00000000-0000-0000-0000-000000000000',
        'reception',
      ));
    it('GET /attachments/:id', () =>
      expectForbidden(
        'get',
        '/attachments/00000000-0000-0000-0000-000000000000',
        'reception',
      ));
    it('GET /drugs', () => expectForbidden('get', '/drugs', 'reception'));
    it('GET /audit-logs', () => expectForbidden('get', '/audit-logs', 'reception'));
    it('GET /settings', () => expectForbidden('get', '/settings', 'reception'));
    it('GET /users', () => expectForbidden('get', '/users', 'reception'));
    it('GET /reports/summary', () =>
      expectForbidden(
        'get',
        '/reports/summary?from=2024-01-01&to=2024-01-31',
        'reception',
      ));
    it('GET /closing/preview', () =>
      expectForbidden('get', '/closing/preview?date=2024-01-01', 'reception'));
  });

  // ── ADMIN has broad access ────────────────────────────────────────────────
  describe('ADMIN can access all route areas', () => {
    it('GET /patients', () => expectAllowed('get', '/patients', 'admin'));
    it('GET /users', () => expectAllowed('get', '/users', 'admin'));
    it('GET /audit-logs', () => expectAllowed('get', '/audit-logs', 'admin'));
    it('GET /settings', () => expectAllowed('get', '/settings', 'admin'));
    it('GET /expense-categories', () =>
      expectAllowed('get', '/expense-categories', 'admin'));
    it('GET /payments', () => expectAllowed('get', '/payments', 'admin'));
    it('GET /expenses', () => expectAllowed('get', '/expenses', 'admin'));
    it('GET /drugs', () => expectAllowed('get', '/drugs', 'admin'));
  });

  // ── RECEPTION allowed routes ─────────────────────────────────────────────
  describe('RECEPTION can access their permitted routes', () => {
    it('GET /patients', () => expectAllowed('get', '/patients', 'reception'));
    it('GET /expense-categories', () =>
      expectAllowed('get', '/expense-categories', 'reception'));
    it('GET /payments', () => expectAllowed('get', '/payments', 'reception'));
    it('GET /expenses', () => expectAllowed('get', '/expenses', 'reception'));
  });

  // ── DOCTOR allowed routes ────────────────────────────────────────────────
  describe('DOCTOR can access their permitted routes', () => {
    it('GET /patients', () => expectAllowed('get', '/patients', 'doctor'));
    it('GET /drugs', () => expectAllowed('get', '/drugs', 'doctor'));
    it('GET /appointments', () =>
      expectAllowed('get', '/appointments', 'doctor'));
    it('GET /prescription-templates', () =>
      expectAllowed('get', '/prescription-templates', 'doctor'));
  });
});

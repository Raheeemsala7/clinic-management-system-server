import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { createTestApp, seedTestUsers } from './helpers/test-app.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    ({ app, prisma } = await createTestApp());
    await seedTestUsers(prisma);
  }, 60000);

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  const BASE = '/api/v1';

  describe('POST /auth/login', () => {
    it('returns tokens for valid credentials', async () => {
      const res = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_admin_e2e', password: 'TestAdmin@123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect((res.body as { user: { role: string } }).user.role).toBe('ADMIN');
    });

    it('returns 401 for wrong password', async () => {
      const res = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_admin_e2e', password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });

    it('returns 401 for unknown username', async () => {
      const res = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'no_such_user', password: 'whatever123' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_doctor_e2e', password: 'TestDoctor@123' });
      refreshToken = (res.body as { refreshToken: string }).refreshToken;
    });

    it('returns new tokens on valid refresh', async () => {
      const res = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      // Token must rotate
      expect((res.body as { refreshToken: string }).refreshToken).not.toBe(refreshToken);
    });

    it('rejects reuse of the same refresh token (family revocation)', async () => {
      const res = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken }); // already used above
      expect(res.status).toBe(403);
    });

    it('rejects invalid refresh token', async () => {
      const res = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: 'not-a-valid-token-string' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user profile', async () => {
      const loginRes = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_recept_e2e', password: 'TestRecept@123' });
      const accessToken = (loginRes.body as { accessToken: string }).accessToken;

      const res = await supertest(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect((res.body as { role: string }).role).toBe('RECEPTION');
    });

    it('returns 401 without a token', async () => {
      const res = await supertest(app.getHttpServer()).get(`${BASE}/auth/me`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes refresh tokens and returns 204', async () => {
      const loginRes = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_admin_e2e', password: 'TestAdmin@123' });
      const { accessToken, refreshToken: rt } = loginRes.body as {
        accessToken: string;
        refreshToken: string;
      };

      const logoutRes = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/logout`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(logoutRes.status).toBe(204);

      // Refresh should now fail
      const refreshRes = await supertest(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: rt });
      expect(refreshRes.status).toBe(401);
    });
  });
});

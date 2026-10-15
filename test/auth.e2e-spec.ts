import * as request from 'supertest';
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
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_admin_e2e', password: 'TestAdmin@123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.role).toBe('ADMIN');
    });

    it('returns 401 for wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_admin_e2e', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 for unknown username', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'no_such_user', password: 'whatever' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_doctor_e2e', password: 'TestDoctor@123' });
      refreshToken = res.body.refreshToken as string;
    });

    it('returns new tokens on valid refresh', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.refreshToken).not.toBe(refreshToken); // rotated
    });

    it('rejects reuse of the same refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken }); // already used above
      expect(res.status).toBe(403); // family revoked
    });

    it('rejects invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: 'notavalidtoken' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ username: 'test_recept_e2e', password: 'TestRecept@123' });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('RECEPTION');
    });

    it('returns 401 without token', async () => {
      const res = await request(app.getHttpServer()).get(`${BASE}/auth/me`);
      expect(res.status).toBe(401);
    });
  });
});

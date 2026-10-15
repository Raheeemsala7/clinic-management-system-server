import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

export interface TestTokens {
  admin: string;
  doctor: string;
  reception: string;
}

export async function createTestApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  const prisma = app.get(PrismaService);
  return { app, prisma };
}

export async function seedTestUsers(prisma: PrismaService): Promise<{ adminId: string; doctorId: string; receptionId: string }> {
  const adminHash = await argon2.hash('TestAdmin@123');
  const doctorHash = await argon2.hash('TestDoctor@123');
  const receptionHash = await argon2.hash('TestRecept@123');

  const [admin, doctor, reception] = await Promise.all([
    prisma.user.create({
      data: { name: 'Test Admin', username: 'test_admin_e2e', passwordHash: adminHash, role: Role.ADMIN },
    }),
    prisma.user.create({
      data: { name: 'Test Doctor', username: 'test_doctor_e2e', passwordHash: doctorHash, role: Role.DOCTOR },
    }),
    prisma.user.create({
      data: { name: 'Test Reception', username: 'test_recept_e2e', passwordHash: receptionHash, role: Role.RECEPTION },
    }),
  ]);

  // Create doctor status
  await prisma.doctorStatus.create({ data: { doctorId: doctor.id, status: 'AVAILABLE' } });

  return { adminId: admin.id, doctorId: doctor.id, receptionId: reception.id };
}

export async function getAuthTokens(app: INestApplication): Promise<TestTokens> {
  const loginAs = async (username: string, password: string): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username, password });
    return res.body.accessToken as string;
  };

  const [admin, doctor, reception] = await Promise.all([
    loginAs('test_admin_e2e', 'TestAdmin@123'),
    loginAs('test_doctor_e2e', 'TestDoctor@123'),
    loginAs('test_recept_e2e', 'TestRecept@123'),
  ]);

  return { admin, doctor, reception };
}

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable built-in logger for sensitive routes in production
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const corsOrigins = configService.get<string[]>('cors.origins', ['http://localhost:3001']);
  const nodeEnv = configService.get<string>('nodeEnv', 'development');

  // ─── Security ───────────────────────────────────────────────────────────────
  app.use((helmet as unknown as typeof helmet.default)());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // ─── Global Validation ───────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── API Versioning ──────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Swagger ──────────────────────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Clinic Management API')
      .setDescription('Single-doctor clinic management system backend')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth')
      .addTag('Users')
      .addTag('Patients')
      .addTag('Appointments')
      .addTag('Queue')
      .addTag('Visits')
      .addTag('Prescriptions')
      .addTag('Drugs')
      .addTag('Attachments')
      .addTag('Payments')
      .addTag('Expenses')
      .addTag('Closing')
      .addTag('Reports')
      .addTag('Audit')
      .addTag('Settings')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`\n🏥 Clinic API running on: http://localhost:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    console.log(`📖 Swagger docs at:     http://localhost:${port}/docs`);
  }
}

bootstrap();

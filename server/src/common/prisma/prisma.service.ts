import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Neon free-tier can cold-start: set generous connect timeout and one retry.
      // connection_limit=1 is recommended for serverless; bump in long-running server use.
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    // One automatic retry on first connect to handle Neon cold-start delays
    let attempts = 0;
    while (attempts < 2) {
      try {
        await this.$connect();
        this.logger.log('Database connected');
        return;
      } catch (err) {
        attempts++;
        if (attempts >= 2) throw err;
        this.logger.warn(`DB connect attempt ${attempts} failed, retrying in 3 s…`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Truncates all tables — ONLY available in test environment.
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase cannot be called in production');
    }
    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname='public'
      AND tablename NOT IN ('_prisma_migrations')
    `;
    for (const { tablename } of tablenames) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }
  }
}

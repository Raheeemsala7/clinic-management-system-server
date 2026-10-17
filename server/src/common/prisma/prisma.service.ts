import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private keepAliveTimer: NodeJS.Timeout | null = null;

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
        this.startKeepAlive();
        return;
      } catch (err) {
        attempts++;
        if (attempts >= 2) throw err;
        this.logger.warn(`DB connect attempt ${attempts} failed, retrying in 3 s…`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  private startKeepAlive() {
    // Neon auto-suspends compute after 5 minutes of inactivity.
    // Ping every 2.5 minutes (150,000ms) with SELECT 1 to keep connection warm and prevent scale-to-zero.
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    this.keepAliveTimer = setInterval(async () => {
      try {
        await this.$queryRaw`SELECT 1`;
      } catch (err) {
        this.logger.debug('Keep-alive ping failed, will reconnect on next request');
      }
    }, 150000);
  }

  async onModuleDestroy() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
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

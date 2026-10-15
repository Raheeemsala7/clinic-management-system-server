import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

export interface AuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
}

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId ?? null,
          before: entry.before ?? undefined,
          after: entry.after ?? undefined,
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
        },
      });
    } catch {
      // Audit failures should not break the main operation
    }
  }

  /**
   * Log an event without a real user (e.g., failed login for unknown username).
   * Falls back to system user placeholder — only used when no real userId exists.
   */
  async logSystem(
    action: string,
    entityType: string,
    entityId: string | null,
    ip: string,
    meta?: Record<string, unknown>,
  ): Promise<void> {
    // Don't write to DB with a fake UUID — just log to console for failed logins with unknown users
    // In production a dedicated security log would be more appropriate
    console.log(`[AUDIT-SYSTEM] action=${action} entityType=${entityType} ip=${ip}`, meta ?? '');
  }

  async findAll(query: {
    userId?: string;
    entityType?: string;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  }) {
    const where = {
      ...(query.userId && { userId: query.userId }),
      ...(query.entityType && { entityType: query.entityType }),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from && { gte: query.from }),
              ...(query.to && { lte: query.to }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { user: { select: { id: true, name: true, username: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
          // Cast to Prisma's InputJsonValue — Records are valid JSON objects
          before: (entry.before ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          after: (entry.after ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
        },
      });
    } catch {
      // Audit failures must never break the main operation
    }
  }

  /**
   * Log a security event when no real userId exists (e.g. failed login for unknown user).
   * Written to stdout only — no DB row — because AuditLog requires a valid userId FK.
   */
  logSystem(
    action: string,
    entityType: string,
    entityId: string | null,
    ip: string,
    meta?: Record<string, unknown>,
  ): void {
    console.log(
      `[AUDIT-SYSTEM] action=${action} entityType=${entityType} entityId=${entityId} ip=${ip}`,
      meta ?? '',
    );
  }

  async findAll(query: {
    userId?: string;
    entityType?: string;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      ...(query.userId && { userId: query.userId }),
      ...(query.entityType && { entityType: query.entityType }),
      ...((query.from || query.to) && {
        createdAt: {
          ...(query.from && { gte: query.from }),
          ...(query.to && { lte: query.to }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          user: { select: { id: true, name: true, username: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}

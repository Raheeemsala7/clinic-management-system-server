import { AuditLog } from '../models';

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

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await AuditLog.create({
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
    });
  } catch (err) {
    // Audit logging failure must never break normal flow
    console.error('Audit log failed:', err);
  }
}

export function logAuditSystem(
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

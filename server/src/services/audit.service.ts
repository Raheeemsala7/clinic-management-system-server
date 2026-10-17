import { AuditLog, User } from '../models';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';

export interface AuditLogQueryParams {
  userId?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: string;
  pageSize?: string;
}

export class AuditService {
  async getLogs(params: AuditLogQueryParams) {
    const { userId, entityType, from, to } = params;
    const { skip, take, page, pageSize } = parsePagination({
      page: params.page,
      pageSize: params.pageSize,
    });

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (entityType) filter.entityType = entityType;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      AuditLog.countDocuments(filter),
    ]);

    const populated = await Promise.all(
      logs.map(async (log) => {
        const user = await User.findById(log.userId).select('id name username role');
        return {
          ...log.toJSON(),
          user: user ? user.toJSON() : null,
        };
      }),
    );

    return buildPaginatedResult(populated, total, page, pageSize);
  }
}

export const auditService = new AuditService();

import { Request, Response } from 'express';
import { auditService } from '../services/audit.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class AuditController {
  getLogs = asyncHandler(async (req: Request, res: Response) => {
    const { userId, entityType, from, to, page, pageSize } = req.query;
    const result = await auditService.getLogs({
      userId: userId as string,
      entityType: entityType as string,
      from: from as string,
      to: to as string,
      page: page as string,
      pageSize: pageSize as string,
    });
    res.json(result);
  });
}

export const auditController = new AuditController();

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

export class AttachmentsController {
  getFile = asyncHandler(async (_req: Request, res: Response) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attachments are disabled' } });
  });

  deleteFile = asyncHandler(async (_req: Request, res: Response) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attachments are disabled' } });
  });
}

export const attachmentsController = new AttachmentsController();

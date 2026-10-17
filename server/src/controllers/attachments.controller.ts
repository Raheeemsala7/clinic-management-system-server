import { Request, Response } from 'express';
import { AttachmentsService } from '../services/attachments.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class AttachmentsController {
  getFile = asyncHandler(async (req: Request, res: Response) => {
    const { attachment, stream } = await AttachmentsService.getFileStream(req.params.id);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.fileName)}"`);
    stream.pipe(res);
  });

  deleteFile = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    await AttachmentsService.softDelete(req.params.id, req.user!.id, ip);
    res.status(204).send();
  });
}

export const attachmentsController = new AttachmentsController();

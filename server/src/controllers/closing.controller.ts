import { Request, Response } from 'express';
import { closingService } from '../services/closing.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/response';

export class ClosingController {
  getPreview = asyncHandler(async (req: Request, res: Response) => {
    const preview = await closingService.getPreview(req.query.date as string);
    sendSuccess(res, preview);
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await closingService.getStatus(req.query.date as string);
    sendSuccess(res, status);
  });

  getHistory = asyncHandler(async (_req: Request, res: Response) => {
    const history = await closingService.getHistory();
    sendSuccess(res, history);
  });

  closeDay = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await closingService.closeDay(req.body, { id: req.user!.id }, ip);
    sendSuccess(res, result, { message: 'Day closed successfully' });
  });

  reopenDay = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await closingService.reopenDay(req.params.id, { id: req.user!.id }, ip);
    sendSuccess(res, result, { message: 'Day reopened successfully' });
  });
}

export const closingController = new ClosingController();

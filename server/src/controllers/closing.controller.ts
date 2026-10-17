import { Request, Response } from 'express';
import { closingService } from '../services/closing.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class ClosingController {
  getPreview = asyncHandler(async (req: Request, res: Response) => {
    const preview = await closingService.getPreview(req.query.date as string);
    res.json(preview);
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await closingService.getStatus(req.query.date as string);
    res.json(status);
  });

  getHistory = asyncHandler(async (_req: Request, res: Response) => {
    const history = await closingService.getHistory();
    res.json(history);
  });

  closeDay = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await closingService.closeDay(req.body, { id: req.user!.id }, ip);
    res.json(result);
  });

  reopenDay = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await closingService.reopenDay(req.params.id, { id: req.user!.id }, ip);
    res.json(result);
  });
}

export const closingController = new ClosingController();

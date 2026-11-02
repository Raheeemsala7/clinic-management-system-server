import { Request, Response } from 'express';
import { VisitsService } from '../services/visits.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/response';

export class VisitsController {
  getVisitById = asyncHandler(async (req: Request, res: Response) => {
    const visit = await VisitsService.getVisitById(req.params.id, req.user!.id);
    sendSuccess(res, visit);
  });

  autosaveVisit = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.autosaveVisit(
      req.params.id,
      req.body,
      req.user!.id,
      ip,
    );
    sendSuccess(res, result, { message: 'Visit auto-saved successfully' });
  });

  closeVisit = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.closeVisit(req.params.id, req.user!.id, ip);
    sendSuccess(res, result, { message: 'Visit closed successfully' });
  });

  reopenVisit = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.reopenVisit(req.params.id, req.user!.id, ip);
    sendSuccess(res, result, { message: 'Visit reopened successfully' });
  });

  addPrescription = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.addPrescription(
      req.params.visitId,
      req.body,
      req.user!.id,
      ip,
    );
    sendSuccess(res, result, { code: 201, message: 'Prescription added successfully' });
  });
}

export const visitsController = new VisitsController();

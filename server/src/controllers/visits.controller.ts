import { Request, Response } from 'express';
import { VisitsService } from '../services/visits.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class VisitsController {
  getVisitById = asyncHandler(async (req: Request, res: Response) => {
    const visit = await VisitsService.getVisitById(req.params.id, req.user!.id);
    res.json(visit);
  });

  autosaveVisit = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.autosaveVisit(
      req.params.id,
      req.body,
      req.user!.id,
      ip,
    );
    res.json(result);
  });

  closeVisit = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.closeVisit(req.params.id, req.user!.id, ip);
    res.json(result);
  });

  reopenVisit = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.reopenVisit(req.params.id, req.user!.id, ip);
    res.json(result);
  });

  addPrescription = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.addPrescription(
      req.params.visitId,
      req.body,
      req.user!.id,
      ip,
    );
    res.status(201).json(result);
  });

  addAttachment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await VisitsService.addAttachment(
      req.params.visitId,
      req.file,
      req.user!.id,
      ip,
    );
    res.status(201).json(result);
  });
}

export const visitsController = new VisitsController();

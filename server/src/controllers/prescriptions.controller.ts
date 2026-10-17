import { Request, Response } from 'express';
import { PrescriptionsService } from '../services/prescriptions.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class PrescriptionsController {
  getPrintReady = asyncHandler(async (req: Request, res: Response) => {
    const result = await PrescriptionsService.getPrintReady(req.params.id, req.user!.id);
    res.json(result);
  });

  markPrinted = asyncHandler(async (req: Request, res: Response) => {
    const result = await PrescriptionsService.markPrinted(req.params.id, req.user!.id);
    res.json(result);
  });

  getByPatient = asyncHandler(async (req: Request, res: Response) => {
    const result = await PrescriptionsService.getByPatient(
      req.params.patientId,
      req.query.page as string,
      req.query.pageSize as string,
    );
    res.json(result);
  });

  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const templates = await PrescriptionsService.getTemplates(req.user!.id);
    res.json(templates);
  });

  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await PrescriptionsService.createTemplate(req.user!.id, req.body);
    res.status(201).json(template);
  });

  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    await PrescriptionsService.deleteTemplate(req.params.id, req.user!.id);
    res.status(204).send();
  });
}

export const prescriptionsController = new PrescriptionsController();

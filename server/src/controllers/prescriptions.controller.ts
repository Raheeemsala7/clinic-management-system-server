import { Request, Response } from 'express';
import { PrescriptionsService } from '../services/prescriptions.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendPaginated, sendNoContent } from '../utils/response';

export class PrescriptionsController {
  getPrintReady = asyncHandler(async (req: Request, res: Response) => {
    const result = await PrescriptionsService.getPrintReady(req.params.id, req.user!.id);
    sendSuccess(res, result);
  });

  markPrinted = asyncHandler(async (req: Request, res: Response) => {
    const result = await PrescriptionsService.markPrinted(req.params.id, req.user!.id);
    sendSuccess(res, result, { message: 'Prescription marked as printed' });
  });

  getByPatient = asyncHandler(async (req: Request, res: Response) => {
    const result = await PrescriptionsService.getByPatient(
      req.params.patientId,
      req.query.page as string,
      req.query.pageSize as string,
    );
    sendPaginated(res, result);
  });

  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const templates = await PrescriptionsService.getTemplates(req.user!.id);
    sendSuccess(res, templates);
  });

  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await PrescriptionsService.createTemplate(req.user!.id, req.body);
    sendSuccess(res, template, { code: 201, message: 'Prescription template created successfully' });
  });

  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    await PrescriptionsService.deleteTemplate(req.params.id, req.user!.id);
    sendNoContent(res);
  });
}

export const prescriptionsController = new PrescriptionsController();

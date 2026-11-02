import { Request, Response } from 'express';
import { PatientsService } from '../services/patients.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/response';

export class PatientsController {
  createPatient = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const patient = await PatientsService.createPatient(
      req.body,
      { id: req.user!.id, role: req.user!.role },
      ip,
    );
    sendSuccess(res, patient, { code: 201, message: 'Patient created successfully' });
  });

  searchPatients = asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const result = await PatientsService.searchPatients(
      q,
      req.user!.role,
      req.query.page as string,
      req.query.pageSize as string,
    );
    sendPaginated(res, result);
  });

  getPatientById = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientsService.getPatientById(req.params.id, req.user!.role);
    sendSuccess(res, patient);
  });

  updatePatient = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const patient = await PatientsService.updatePatient(
      req.params.id,
      req.body,
      { id: req.user!.id, role: req.user!.role },
      ip,
    );
    sendSuccess(res, patient, { message: 'Patient updated successfully' });
  });

  getPatientHistory = asyncHandler(async (req: Request, res: Response) => {
    const result = await PatientsService.getPatientHistory(
      req.params.id,
      req.query.page as string,
      req.query.pageSize as string,
    );
    sendPaginated(res, result);
  });

  getPatientSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await PatientsService.getPatientSummary(req.params.id);
    sendSuccess(res, summary);
  });

  getPatientBookingSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await PatientsService.getPatientBookingSummary(req.params.id);
    sendSuccess(res, summary);
  });
}

export const patientsController = new PatientsController();

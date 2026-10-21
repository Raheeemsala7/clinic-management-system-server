import { Request, Response } from 'express';
import { PatientsService } from '../services/patients.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class PatientsController {
  createPatient = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const patient = await PatientsService.createPatient(
      req.body,
      { id: req.user!.id, role: req.user!.role },
      ip,
    );
    res.status(201).json(patient);
  });

  searchPatients = asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const result = await PatientsService.searchPatients(
      q,
      req.user!.role,
      req.query.page as string,
      req.query.pageSize as string,
    );
    res.json(result);
  });

  getPatientById = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientsService.getPatientById(req.params.id, req.user!.role);
    res.json(patient);
  });

  updatePatient = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const patient = await PatientsService.updatePatient(
      req.params.id,
      req.body,
      { id: req.user!.id, role: req.user!.role },
      ip,
    );
    res.json(patient);
  });

  getPatientHistory = asyncHandler(async (req: Request, res: Response) => {
    const result = await PatientsService.getPatientHistory(
      req.params.id,
      req.query.page as string,
      req.query.pageSize as string,
    );
    res.json(result);
  });

  getPatientSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await PatientsService.getPatientSummary(req.params.id);
    res.json(summary);
  });

  getPatientBookingSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await PatientsService.getPatientBookingSummary(req.params.id);
    res.json(summary);
  });
}

export const patientsController = new PatientsController();

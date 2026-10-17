import { Request, Response } from 'express';
import { AppointmentsService } from '../services/appointments.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class AppointmentsController {
  createAppointment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await AppointmentsService.createAppointment(
      req.body,
      { id: req.user!.id },
      ip,
    );
    res.status(201).json(result);
  });

  listAppointments = asyncHandler(async (req: Request, res: Response) => {
    const result = await AppointmentsService.listAppointments(req.query);
    res.json(result);
  });

  getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
    const result = await AppointmentsService.getAppointmentById(req.params.id);
    res.json(result);
  });

  transition = (action: 'arrive' | 'start' | 'complete' | 'cancel' | 'no-show' | 'postpone') =>
    asyncHandler(async (req: Request, res: Response) => {
      const ip = req.ip || req.socket.remoteAddress || '';
      const result = await AppointmentsService.transition(
        req.params.id,
        action,
        { id: req.user!.id },
        ip,
      );
      res.json(result);
    });
}

export const appointmentsController = new AppointmentsController();

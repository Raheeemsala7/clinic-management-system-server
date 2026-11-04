import { Request, Response } from 'express';
import { AppointmentsService } from '../services/appointments.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/response';

export class AppointmentsController {
  createAppointment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await AppointmentsService.createAppointment(
      req.body,
      { id: req.user!.id },
      ip,
    );
    sendSuccess(res, result, { code: 201, message: 'Appointment created successfully' });
  });

  updateAppointment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await AppointmentsService.updateAppointment(
      req.params.id,
      req.body,
      { id: req.user!.id },
      ip,
    );
    sendSuccess(res, result, { message: 'Appointment updated successfully' });
  });

  listAppointments = asyncHandler(async (req: Request, res: Response) => {
    const result = await AppointmentsService.listAppointments(req.query);
    sendPaginated(res, result);
  });

  getCalendar = asyncHandler(async (req: Request, res: Response) => {
    const result = await AppointmentsService.getCalendarView(req.query, req.user);
    sendSuccess(res, result);
  });

  getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
    const result = await AppointmentsService.getAppointmentById(req.params.id);
    sendSuccess(res, result);
  });

  transition = (action: 'arrive' | 'start' | 'finish-exam' | 'checkout' | 'complete' | 'cancel' | 'no-show' | 'postpone') =>
    asyncHandler(async (req: Request, res: Response) => {
      const ip = req.ip || req.socket.remoteAddress || '';
      const result = await AppointmentsService.transition(
        req.params.id,
        action,
        { id: req.user!.id, role: req.user!.role },
        ip,
      );
      sendSuccess(res, result, { message: `Appointment transitioned to ${action}` });
    });

  checkout = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await AppointmentsService.checkout(
      req.params.id,
      req.body,
      { id: req.user!.id },
      ip,
    );
    sendSuccess(res, result, { message: 'Appointment checked out successfully' });
  });

  payRemaining = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await AppointmentsService.payRemaining(
      req.params.id,
      req.body,
      { id: req.user!.id },
      ip,
    );
    sendSuccess(res, result, { message: 'Remaining balance paid successfully' });
  });
}

export const appointmentsController = new AppointmentsController();

import { Request, Response } from 'express';
import { DoctorScheduleService } from '../services/doctor-schedule.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/response';

export class DoctorScheduleController {
  getSchedule = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const schedule = await DoctorScheduleService.getDoctorSchedule(doctorId);
    sendSuccess(res, schedule);
  });

  updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const schedule = await DoctorScheduleService.updateDoctorSchedule(doctorId, req.body);
    sendSuccess(res, schedule, { message: 'Doctor schedule updated successfully' });
  });

  getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const date = (req.query.date as string) || '';
    const slots = await DoctorScheduleService.getAvailableSlots(doctorId, date);
    sendSuccess(res, slots);
  });
}

export const doctorScheduleController = new DoctorScheduleController();

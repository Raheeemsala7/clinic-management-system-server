import { Request, Response } from 'express';
import { DoctorScheduleService } from '../services/doctor-schedule.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class DoctorScheduleController {
  getSchedule = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const schedule = await DoctorScheduleService.getDoctorSchedule(doctorId);
    res.json(schedule);
  });

  updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const schedule = await DoctorScheduleService.updateDoctorSchedule(doctorId, req.body);
    res.json(schedule);
  });

  getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const date = (req.query.date as string) || '';
    const slots = await DoctorScheduleService.getAvailableSlots(doctorId, date);
    res.json(slots);
  });
}

export const doctorScheduleController = new DoctorScheduleController();

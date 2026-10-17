import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class QueueController {
  getTodayQueue = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = (req.query.doctorId as string) || req.user?.id;
    const queue = await QueueService.getTodayQueue(doctorId);
    res.json(queue);
  });

  getDoctorStatus = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = (req.query.doctorId as string) || req.user?.id;
    const status = await QueueService.getDoctorStatus(doctorId);
    res.json(status);
  });

  setDoctorStatus = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.user!.id;
    const status = await QueueService.setDoctorStatus(doctorId, req.body.status);
    res.json(status);
  });
}

export const queueController = new QueueController();

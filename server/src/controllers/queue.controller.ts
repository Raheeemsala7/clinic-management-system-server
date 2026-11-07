import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/response';

export class QueueController {
  getTodayQueue = asyncHandler(async (req: Request, res: Response) => {
    const rawDoctorId = req.query.doctorId as string;
    const isDoctor = req.user?.role === 'DOCTOR';
    const doctorId = (rawDoctorId && rawDoctorId !== 'all') ? rawDoctorId : (isDoctor ? req.user!.id : undefined);

    let queue = await QueueService.getTodayQueue(doctorId);

    // إذا كان الطبيب مسجل ولم يجد أي حالات مخصصة له، ولكن هناك حالات بالعيادة غير مسندة أو مسجلة
    // نعيد طابور العيادة كاملاً حتى لا يختفي المريض إذا سجله الاستقبال بدون تحديد الطبيب أو بتحديد طبيب بديل
    if (doctorId && isDoctor && queue.length === 0) {
      const allClinicQueue = await QueueService.getTodayQueue();
      if (allClinicQueue.length > 0) {
        queue = allClinicQueue;
      }
    }

    sendSuccess(res, queue);
  });

  getDoctorStatus = asyncHandler(async (req: Request, res: Response) => {
    const doctorId =
      (req.query.doctorId as string) ||
      (req.user?.role === 'DOCTOR' ? req.user.id : undefined);
    const status = await QueueService.getDoctorStatus(doctorId);
    sendSuccess(res, status);
  });

  setDoctorStatus = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.user!.id;
    const status = await QueueService.setDoctorStatus(doctorId, req.body.status);
    sendSuccess(res, status, { message: 'Doctor status updated successfully' });
  });
}

export const queueController = new QueueController();

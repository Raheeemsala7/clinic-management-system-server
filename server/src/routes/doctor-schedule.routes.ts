import { Router } from 'express';
import { doctorScheduleController } from '../controllers/doctor-schedule.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Available slots for booking on a specific date (Reception, Doctor, Admin)
router.get('/:doctorId/available-slots', doctorScheduleController.getAvailableSlots);

// Get schedule configuration
router.get('/:doctorId', doctorScheduleController.getSchedule);

// Update schedule (Doctor or Admin)
router.put('/:doctorId', requireRoles('DOCTOR', 'ADMIN'), doctorScheduleController.updateSchedule);

export default router;

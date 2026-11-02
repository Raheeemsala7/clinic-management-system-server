import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/queue/today', authMiddleware, queueController.getTodayQueue);
router.get('/doctor-status', authMiddleware, queueController.getDoctorStatus);
router.put('/doctor-status', authMiddleware, requireRoles('DOCTOR'), queueController.setDoctorStatus);

export default router;

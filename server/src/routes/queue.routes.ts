import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/queue/today', queueController.getTodayQueue);
router.get('/doctor-status', queueController.getDoctorStatus);
router.put('/doctor-status', requireRoles('DOCTOR'), queueController.setDoctorStatus);

export default router;

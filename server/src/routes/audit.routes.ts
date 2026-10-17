import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', requireRoles('ADMIN'), auditController.getLogs);

export default router;

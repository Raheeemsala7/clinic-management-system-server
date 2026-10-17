import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', requireRoles('ADMIN'), settingsController.getAll);
router.put('/', requireRoles('ADMIN'), settingsController.update);

export default router;

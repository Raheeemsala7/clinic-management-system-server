import { Router } from 'express';
import { closingController } from '../controllers/closing.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/preview', requireRoles('ADMIN', 'RECEPTION'), closingController.getPreview);
router.get('/status', requireRoles('ADMIN', 'RECEPTION'), closingController.getStatus);
router.get('/history', requireRoles('ADMIN'), closingController.getHistory);
router.post('/', requireRoles('ADMIN', 'RECEPTION'), closingController.closeDay);
router.post('/:id/reopen', requireRoles('ADMIN'), closingController.reopenDay);

export default router;

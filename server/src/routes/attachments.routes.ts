import { Router } from 'express';
import { attachmentsController } from '../controllers/attachments.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/:id', requireRoles('ADMIN', 'DOCTOR'), attachmentsController.getFile);
router.delete('/:id', requireRoles('ADMIN', 'DOCTOR'), attachmentsController.deleteFile);

export default router;

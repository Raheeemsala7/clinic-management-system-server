import { Router } from 'express';
import { visitsController } from '../controllers/visits.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();
router.use(authMiddleware);

router.get('/:id', requireRoles('ADMIN', 'DOCTOR'), visitsController.getVisitById);
router.patch('/:id', requireRoles('ADMIN', 'DOCTOR'), visitsController.autosaveVisit);
router.post('/:id/close', requireRoles('ADMIN', 'DOCTOR'), visitsController.closeVisit);
router.post('/:id/reopen', requireRoles('ADMIN', 'DOCTOR'), visitsController.reopenVisit);
router.post(
  '/:visitId/prescriptions',
  requireRoles('ADMIN', 'DOCTOR'),
  visitsController.addPrescription,
);
router.post(
  '/:visitId/attachments',
  requireRoles('ADMIN', 'DOCTOR'),
  uploadMiddleware.single('file'),
  visitsController.addAttachment,
);

export default router;

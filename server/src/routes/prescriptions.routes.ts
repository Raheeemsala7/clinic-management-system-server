import { Router } from 'express';
import { prescriptionsController } from '../controllers/prescriptions.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

// Prescription endpoints
router.get('/prescriptions/:id', authMiddleware, requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.getPrintReady);
router.post('/prescriptions/:id/mark-printed', authMiddleware, requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.markPrinted);
router.get('/patients/:patientId/prescriptions', authMiddleware, requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.getByPatient);

// Prescription templates
router.get('/prescription-templates', authMiddleware, requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.getTemplates);
router.post('/prescription-templates', authMiddleware, requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.createTemplate);
router.delete('/prescription-templates/:id', authMiddleware, requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.deleteTemplate);

export default router;

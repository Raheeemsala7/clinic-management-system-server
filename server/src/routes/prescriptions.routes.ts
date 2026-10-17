import { Router } from 'express';
import { prescriptionsController } from '../controllers/prescriptions.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Prescription endpoints
router.get('/prescriptions/:id', requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.getPrintReady);
router.post('/prescriptions/:id/mark-printed', requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.markPrinted);
router.get('/patients/:patientId/prescriptions', requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.getByPatient);

// Prescription templates
router.get('/prescription-templates', requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.getTemplates);
router.post('/prescription-templates', requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.createTemplate);
router.delete('/prescription-templates/:id', requireRoles('ADMIN', 'DOCTOR'), prescriptionsController.deleteTemplate);

export default router;

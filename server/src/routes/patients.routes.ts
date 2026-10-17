import { Router } from 'express';
import { patientsController } from '../controllers/patients.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/', patientsController.createPatient);
router.get('/', patientsController.searchPatients);
router.get('/:id', patientsController.getPatientById);
router.put('/:id', patientsController.updatePatient);
router.get('/:id/history', requireRoles('ADMIN', 'DOCTOR'), patientsController.getPatientHistory);
router.get('/:id/summary', requireRoles('ADMIN', 'DOCTOR'), patientsController.getPatientSummary);

export default router;

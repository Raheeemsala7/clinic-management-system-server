import { Router } from 'express';
import { appointmentsController } from '../controllers/appointments.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/', appointmentsController.createAppointment);
router.get('/', appointmentsController.listAppointments);
router.get('/:id', appointmentsController.getAppointmentById);

// Appointment lifecycle transition endpoints
router.post('/:id/arrive', appointmentsController.transition('arrive'));
router.post('/:id/start', requireRoles('ADMIN', 'DOCTOR'), appointmentsController.transition('start'));
router.post('/:id/complete', requireRoles('ADMIN', 'DOCTOR'), appointmentsController.transition('complete'));
router.post('/:id/cancel', appointmentsController.transition('cancel'));
router.post('/:id/no-show', appointmentsController.transition('no-show'));
router.post('/:id/postpone', appointmentsController.transition('postpone'));

export default router;

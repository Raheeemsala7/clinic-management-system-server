import { Router } from 'express';
import { appointmentsController } from '../controllers/appointments.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/', appointmentsController.createAppointment);
router.get('/', appointmentsController.listAppointments);
router.get('/:id', appointmentsController.getAppointmentById);
router.put('/:id', appointmentsController.updateAppointment);

// Appointment lifecycle transition endpoints
router.post('/:id/arrive', appointmentsController.transition('arrive'));
router.post('/:id/start', requireRoles('ADMIN', 'DOCTOR', 'RECEPTION'), appointmentsController.transition('start'));
router.post('/:id/finish-exam', requireRoles('ADMIN', 'DOCTOR'), appointmentsController.transition('finish-exam'));
router.post('/:id/checkout', requireRoles('ADMIN', 'RECEPTION'), appointmentsController.checkout);
router.post('/:id/complete', requireRoles('ADMIN', 'DOCTOR', 'RECEPTION'), appointmentsController.transition('complete'));
router.post('/:id/cancel', appointmentsController.transition('cancel'));
router.post('/:id/no-show', appointmentsController.transition('no-show'));
router.post('/:id/postpone', appointmentsController.transition('postpone'));
router.post('/:id/pay-remaining', requireRoles('ADMIN', 'RECEPTION'), appointmentsController.payRemaining);

export default router;

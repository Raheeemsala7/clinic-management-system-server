import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

router.post('/appointments/:id/payments', authMiddleware, requireRoles('ADMIN', 'RECEPTION'), paymentsController.recordPayment);
router.get('/payments', authMiddleware, requireRoles('ADMIN', 'RECEPTION'), paymentsController.listPayments);
router.post('/payments/:id/void', authMiddleware, requireRoles('ADMIN'), paymentsController.voidPayment);

export default router;

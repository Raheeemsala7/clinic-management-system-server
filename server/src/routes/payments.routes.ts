import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/appointments/:id/payments', requireRoles('ADMIN', 'RECEPTION'), paymentsController.recordPayment);
router.get('/payments', requireRoles('ADMIN', 'RECEPTION'), paymentsController.listPayments);
router.post('/payments/:id/void', requireRoles('ADMIN'), paymentsController.voidPayment);

export default router;

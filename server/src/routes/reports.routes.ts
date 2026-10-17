import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/summary', requireRoles('ADMIN'), reportsController.getSummary);
router.get('/income-by-day', requireRoles('ADMIN'), reportsController.getIncomeByDay);
router.get('/expenses-by-category', requireRoles('ADMIN'), reportsController.getExpensesByCategory);
router.get('/payments-by-method', requireRoles('ADMIN'), reportsController.getPaymentsByMethod);

export default router;

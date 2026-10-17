import { Router } from 'express';
import { expensesController } from '../controllers/expenses.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/expenses', requireRoles('ADMIN', 'RECEPTION'), expensesController.createExpense);
router.get('/expenses', requireRoles('ADMIN', 'RECEPTION'), expensesController.listExpenses);
router.post('/expenses/:id/approve', requireRoles('ADMIN'), expensesController.approveExpense);
router.post('/expenses/:id/reject', requireRoles('ADMIN'), expensesController.rejectExpense);

router.get('/expense-categories', requireRoles('ADMIN', 'RECEPTION'), expensesController.getCategories);
router.post('/expense-categories', requireRoles('ADMIN'), expensesController.createCategory);

export default router;

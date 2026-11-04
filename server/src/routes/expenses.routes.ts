import { Router } from 'express';
import { expensesController } from '../controllers/expenses.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/expenses/budget', authMiddleware, requireRoles('ADMIN', 'RECEPTION'), expensesController.getBudgetStatus);
router.put('/expenses/budget', authMiddleware, requireRoles('ADMIN'), expensesController.updateBudgetLimit);

router.post('/expenses', authMiddleware, requireRoles('ADMIN', 'RECEPTION'), expensesController.createExpense);
router.get('/expenses', authMiddleware, requireRoles('ADMIN', 'RECEPTION'), expensesController.listExpenses);
router.post('/expenses/:id/approve', authMiddleware, requireRoles('ADMIN'), expensesController.approveExpense);
router.post('/expenses/:id/reject', authMiddleware, requireRoles('ADMIN'), expensesController.rejectExpense);

router.get('/expense-categories', authMiddleware, requireRoles('ADMIN', 'RECEPTION'), expensesController.getCategories);
router.post('/expense-categories', authMiddleware, requireRoles('ADMIN'), expensesController.createCategory);

export default router;

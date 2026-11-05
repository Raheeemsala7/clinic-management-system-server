import { Request, Response } from 'express';
import { ExpensesService } from '../services/expenses.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/response';

export class ExpensesController {
  createExpense = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const expense = await ExpensesService.createExpense(
      req.body,
      { id: req.user!.id, role: req.user!.role },
      ip,
    );
    sendSuccess(res, expense, { code: 201, message: 'Expense created successfully' });
  });

  listExpenses = asyncHandler(async (req: Request, res: Response) => {
    const result = await ExpensesService.listExpenses(
      req.query,
      { id: req.user!.id, role: req.user!.role },
    );
    sendPaginated(res, result);
  });

  approveExpense = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const expense = await ExpensesService.approveExpense(req.params.id, req.user!.id, ip);
    sendSuccess(res, expense, { message: 'Expense approved successfully' });
  });

  rejectExpense = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const expense = await ExpensesService.rejectExpense(
      req.params.id,
      req.body.reason,
      req.user!.id,
      ip,
    );
    sendSuccess(res, expense, { message: 'Expense rejected successfully' });
  });

  getBudgetStatus = asyncHandler(async (req: Request, res: Response) => {
    const budget = await ExpensesService.getMonthlyBudgetStatus(
      (req.query.month || req.query.date) as string | undefined
    );
    sendSuccess(res, budget);
  });

  updateBudgetLimit = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const budget = await ExpensesService.updateMonthlyBudgetLimit(req.body.limit, req.user!.id, ip);
    sendSuccess(res, budget, { message: 'Monthly budget limit updated successfully' });
  });

  getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await ExpensesService.getCategories();
    sendSuccess(res, categories);
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await ExpensesService.createCategory(req.body.name);
    sendSuccess(res, category, { code: 201, message: 'Expense category created successfully' });
  });
}

export const expensesController = new ExpensesController();

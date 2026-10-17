import { Request, Response } from 'express';
import { ExpensesService } from '../services/expenses.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class ExpensesController {
  createExpense = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const expense = await ExpensesService.createExpense(
      req.body,
      { id: req.user!.id, role: req.user!.role },
      ip,
    );
    res.status(201).json(expense);
  });

  listExpenses = asyncHandler(async (req: Request, res: Response) => {
    const result = await ExpensesService.listExpenses(
      req.query,
      { id: req.user!.id, role: req.user!.role },
    );
    res.json(result);
  });

  approveExpense = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const expense = await ExpensesService.approveExpense(req.params.id, req.user!.id, ip);
    res.json(expense);
  });

  rejectExpense = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const expense = await ExpensesService.rejectExpense(
      req.params.id,
      req.body.reason,
      req.user!.id,
      ip,
    );
    res.json(expense);
  });

  getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await ExpensesService.getCategories();
    res.json(categories);
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await ExpensesService.createCategory(req.body.name);
    res.status(201).json(category);
  });
}

export const expensesController = new ExpensesController();

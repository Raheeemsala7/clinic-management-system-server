import { Request, Response } from 'express';
import { reportsService } from '../services/reports.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class ReportsController {
  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.getSummary(
      req.query.from as string,
      req.query.to as string,
    );
    res.json(result);
  });

  getIncomeByDay = asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.getIncomeByDay(
      req.query.from as string,
      req.query.to as string,
    );
    res.json(result);
  });

  getExpensesByCategory = asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.getExpensesByCategory(
      req.query.from as string,
      req.query.to as string,
    );
    res.json(result);
  });

  getPaymentsByMethod = asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.getPaymentsByMethod(
      req.query.from as string,
      req.query.to as string,
    );
    res.json(result);
  });
}

export const reportsController = new ReportsController();

import { Request, Response } from 'express';
import { PaymentsService } from '../services/payments.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class PaymentsController {
  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const payment = await PaymentsService.recordPayment(
      req.params.id,
      req.body,
      { id: req.user!.id },
      ip,
    );
    res.status(201).json(payment);
  });

  listPayments = asyncHandler(async (req: Request, res: Response) => {
    const result = await PaymentsService.listPayments(req.query, req.user!.role);
    res.json(result);
  });

  voidPayment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const payment = await PaymentsService.voidPayment(
      req.params.id,
      req.body.reason,
      req.user!.id,
      ip,
    );
    res.json(payment);
  });
}

export const paymentsController = new PaymentsController();

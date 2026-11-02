import { Request, Response } from 'express';
import { PaymentsService } from '../services/payments.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/response';

export class PaymentsController {
  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const payment = await PaymentsService.recordPayment(
      req.params.id,
      req.body,
      { id: req.user!.id },
      ip,
    );
    sendSuccess(res, payment, { code: 201, message: 'Payment recorded successfully' });
  });

  listPayments = asyncHandler(async (req: Request, res: Response) => {
    const result = await PaymentsService.listPayments(req.query, req.user!.role);
    sendPaginated(res, result);
  });

  voidPayment = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const payment = await PaymentsService.voidPayment(
      req.params.id,
      req.body.reason,
      req.user!.id,
      ip,
    );
    sendSuccess(res, payment, { message: 'Payment voided successfully' });
  });
}

export const paymentsController = new PaymentsController();

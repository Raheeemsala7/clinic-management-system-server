import { Payment, Appointment, DailyClosing } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class PaymentsService {
  static async recordPayment(appointmentId: string, dto: any, actor: { id: string }, ip = '') {
    const { amount, method, kind } = dto;

    if (!amount || !method || !kind) {
      throw new BadRequestError('amount, method, and kind are required');
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment not found');

    const closed = await DailyClosing.findOne({ clinicDate: appointment.clinicDate });
    if (closed && !closed.reopenedAt) {
      throw new ConflictError('Cannot add payments for a closed clinic day', 'DAY_CLOSED');
    }

    const payment = await Payment.create({
      appointmentId,
      patientId: appointment.patientId,
      amount: Number(amount),
      method,
      kind,
      receivedById: actor.id,
      status: 'RECORDED',
    });

    await logAudit({
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Payment',
      entityId: payment.id,
      after: { amount: payment.amount, method: payment.method },
      ip,
    });

    return payment.toJSON();
  }

  static async listPayments(query: any, actorRole: string) {
    const { date, page: pageQuery, pageSize: pageSizeQuery } = query;
    const today = getTodayClinicDate();

    if (actorRole === 'RECEPTION' && date && date !== today) {
      throw new ForbiddenError("Reception can only view today's payments");
    }

    const effectiveDate = actorRole === 'RECEPTION' ? today : (date as string | undefined);

    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    let paymentFilter: any = {};
    if (effectiveDate) {
      const appointments = await Appointment.find({ clinicDate: effectiveDate }).select('_id');
      const apptIds = appointments.map((a) => a.id);
      paymentFilter = { appointmentId: { $in: apptIds } };
    }

    const [payments, total] = await Promise.all([
      Payment.find(paymentFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Payment.countDocuments(paymentFilter),
    ]);

    const populated = await Promise.all(
      payments.map(async (p) => {
        const appointment = await Appointment.findById(p.appointmentId).select('clinicDate type');
        return {
          ...p.toJSON(),
          appointment: appointment ? { clinicDate: appointment.clinicDate, type: appointment.type } : null,
        };
      }),
    );

    return buildPaginatedResult(populated, total, page, pageSize);
  }

  static async voidPayment(id: string, reason?: string, actorId = '', ip = '') {
    if (!reason) {
      throw new BadRequestError('Reason is required to void payment');
    }

    const payment = await Payment.findById(id);
    if (!payment) throw new NotFoundError('Payment not found');

    if (payment.status === 'VOIDED') {
      throw new ConflictError('Payment has already been voided', 'ALREADY_VOIDED');
    }

    payment.status = 'VOIDED';
    payment.voidReason = reason;
    payment.voidedById = actorId;
    await payment.save();

    await logAudit({
      userId: actorId,
      action: 'VOID',
      entityType: 'Payment',
      entityId: payment.id,
      after: { voidReason: reason },
      ip,
    });

    return payment.toJSON();
  }
}

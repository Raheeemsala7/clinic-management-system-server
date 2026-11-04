import { Payment, Appointment, DailyClosing } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError, ValidationError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class PaymentsService {
  static async recordPayment(appointmentId: string, dto: any, actor: { id: string }, ip = '') {
    const { amount, method, kind } = dto;

    if (!amount || !method || !kind) {
      const errors = [];
      if (!amount) errors.push({ path: 'amount', message: 'amount is required' });
      if (!method) errors.push({ path: 'method', message: 'method is required' });
      if (!kind) errors.push({ path: 'kind', message: 'kind is required' });
      throw new ValidationError('Validation failed', errors);
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

  static async listPayments(query: any, _actorRole?: string) {
    const { date, page: pageQuery, pageSize: pageSizeQuery } = query;
    const today = getTodayClinicDate();

    // Allow filtering by date (today or previous dates)
    const effectiveDate = (date as string | undefined) || today;

    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    let paymentFilter: any = {};
    let apptsOnDate: any[] = [];

    if (effectiveDate && effectiveDate !== 'all') {
      const startOfDay = new Date(`${effectiveDate}T00:00:00.000Z`);
      const endOfDay = new Date(`${effectiveDate}T23:59:59.999Z`);

      apptsOnDate = await Appointment.find({ clinicDate: effectiveDate }).select(
        '_id totalAmount paidAmount remainingAmount paymentStatus isExempt',
      );
      const apptIds = apptsOnDate.map((a) => a.id);

      paymentFilter = {
        $or: [
          { appointmentId: { $in: apptIds } },
          { createdAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      };
    }

    const [payments, total, allRecordedPayments] = await Promise.all([
      Payment.find(paymentFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Payment.countDocuments(paymentFilter),
      Payment.find({ ...paymentFilter, status: 'RECORDED' }).select('amount paymentType appointmentId'),
    ]);

    // Calculate KPI summary for this date
    const totalRemaining = apptsOnDate
      .filter((a) => !a.isExempt)
      .reduce((sum, a) => sum + Math.max(0, Number(a.remainingAmount || 0)), 0);

    const totalCollected = allRecordedPayments.reduce(
      (sum, p) => sum + Math.max(0, Number(p.amount || 0)),
      0,
    );

    const apptsWithRemaining = new Set(
      apptsOnDate.filter((a) => !a.isExempt && a.remainingAmount > 0).map((a) => a.id),
    );

    const activeDeposits = allRecordedPayments.filter(
      (p) => p.paymentType === 'DEPOSIT' && (apptsOnDate.length === 0 || apptsWithRemaining.has(p.appointmentId)),
    );

    const totalDeposits = activeDeposits.reduce(
      (sum, p) => sum + Math.max(0, Number(p.amount || 0)),
      0,
    );

    const depositCount = activeDeposits.length;
    const paidCount = allRecordedPayments.filter(
      (p) => p.paymentType === 'FULL' || p.paymentType === 'REMAINING',
    ).length;
    const remainingDueCount = apptsOnDate.filter((a) => !a.isExempt && a.remainingAmount > 0).length;

    const summary = {
      totalCollected,
      totalDeposits,
      totalRemaining,
      counts: {
        all: total,
        paid: paidCount,
        deposit: depositCount,
        remaining: remainingDueCount,
      },
    };

    const { Patient, User } = await import('../models');
    const populated = await Promise.all(
      payments.map(async (p) => {
        const [appointment, patient, receivedBy] = await Promise.all([
          Appointment.findById(p.appointmentId).select(
            'clinicDate type startTime endTime totalAmount paidAmount remainingAmount paymentStatus isExempt exemptionReason doctorId',
          ),
          Patient.findById(p.patientId).select('id fullName phone'),
          User.findById(p.receivedById).select('id name username'),
        ]);

        let doctor = null;
        if (appointment?.doctorId) {
          doctor = await User.findById(appointment.doctorId).select('id name');
        }

        return {
          ...p.toJSON(),
          patient: patient ? { id: patient.id, fullName: patient.fullName, phone: patient.phone } : null,
          doctor: doctor ? { id: doctor.id, name: doctor.name } : null,
          receivedBy: receivedBy ? { id: receivedBy.id, name: receivedBy.name, username: receivedBy.username } : null,
          appointment: appointment
            ? {
                id: appointment.id,
                clinicDate: appointment.clinicDate,
                type: appointment.type,
                startTime: appointment.startTime || null,
                endTime: appointment.endTime || null,
                totalAmount: appointment.totalAmount,
                paidAmount: appointment.paidAmount,
                remainingAmount: appointment.remainingAmount,
                paymentStatus: appointment.paymentStatus,
                isExempt: appointment.isExempt,
                exemptionReason: appointment.exemptionReason || null,
              }
            : null,
        };
      }),
    );

    return {
      ...buildPaginatedResult(populated, total, page, pageSize),
      summary,
    };
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

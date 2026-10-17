import { DailyClosing, Payment, Expense, Appointment, User } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class ClosingService {
  async calculatePreview(date: string) {
    const appointments = await Appointment.find({ clinicDate: date }).select('_id');
    const apptIds = appointments.map((a) => a.id);

    const cashPayments = await Payment.aggregate([
      {
        $match: {
          appointmentId: { $in: apptIds },
          method: 'CASH',
          status: 'RECORDED',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalCashPayments = cashPayments[0]?.total || 0;

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const approvedExpenses = await Expense.aggregate([
      {
        $match: {
          status: 'APPROVED',
          spentAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalApprovedExpenses = approvedExpenses[0]?.total || 0;
    const expectedCash = totalCashPayments - totalApprovedExpenses;

    return {
      clinicDate: date,
      totalCashPayments: String(totalCashPayments),
      totalApprovedExpenses: String(totalApprovedExpenses),
      expectedCash: String(expectedCash),
    };
  }

  async getPreview(date?: string) {
    const targetDate = date || getTodayClinicDate();
    return this.calculatePreview(targetDate);
  }

  async getStatus(date?: string) {
    const targetDate = date || getTodayClinicDate();
    const closing = await DailyClosing.findOne({ clinicDate: targetDate });
    if (!closing) {
      return null;
    }

    const closedBy = await User.findById(closing.closedById).select('id name username');
    return {
      ...closing.toJSON(),
      closedBy: closedBy ? closedBy.toJSON() : null,
    };
  }

  async getHistory(limit = 30) {
    const history = await DailyClosing.find().sort({ clinicDate: -1 }).limit(limit);

    return Promise.all(
      history.map(async (c) => {
        const closedBy = await User.findById(c.closedById).select('id name username');
        return {
          ...c.toJSON(),
          closedBy: closedBy ? closedBy.toJSON() : null,
        };
      }),
    );
  }

  async closeDay(data: { actualCash: number; notes?: string }, actor: { id: string }, ip: string) {
    const { actualCash, notes } = data;
    const today = getTodayClinicDate();

    if (actualCash === undefined || actualCash === null) {
      throw new BadRequestError('actualCash is required');
    }

    const existing = await DailyClosing.findOne({ clinicDate: today });
    if (existing && !existing.reopenedAt) {
      throw new ConflictError('This clinic day is already closed', 'ALREADY_CLOSED');
    }

    const preview = await this.calculatePreview(today);
    const expected = Number(preview.expectedCash);
    const actual = Number(actualCash);
    const difference = actual - expected;

    const closing = await DailyClosing.findOneAndUpdate(
      { clinicDate: today },
      {
        clinicDate: today,
        expectedCash: expected,
        actualCash: actual,
        difference,
        notes: notes || null,
        closedById: actor.id,
        closedAt: new Date(),
        reopenedAt: undefined,
        reopenedById: undefined,
      },
      { upsert: true, returnDocument: 'after' },
    );

    await logAudit({
      userId: actor.id,
      action: 'CLOSE_DAY',
      entityType: 'DailyClosing',
      entityId: closing.id,
      after: { clinicDate: today, actualCash, difference },
      ip,
    });

    return {
      expectedCash: String(expected),
      actualCash: String(actual),
      difference: String(difference),
    };
  }

  async reopenDay(id: string, actor: { id: string }, ip: string) {
    const closing = await DailyClosing.findById(id);
    if (!closing) throw new NotFoundError('Closing record not found');

    closing.reopenedAt = new Date();
    closing.reopenedById = actor.id;
    await closing.save();

    await logAudit({
      userId: actor.id,
      action: 'REOPEN_DAY',
      entityType: 'DailyClosing',
      entityId: id,
      ip,
    });

    return closing.toJSON();
  }
}

export const closingService = new ClosingService();

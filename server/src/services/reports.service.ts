import { Payment, Expense, Visit, Appointment } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';

export class ReportsService {
  async getSummary(fromQuery?: string, toQuery?: string) {
    const today = getTodayClinicDate();
    const from = fromQuery || today.slice(0, 7) + '-01';
    const to = toQuery || today;

    // Find appointments in date range
    const appointments = await Appointment.find({
      clinicDate: { $gte: from, $lte: to },
    }).select('_id');
    const apptIds = appointments.map((a) => a.id);

    const startOfFrom = new Date(`${from}T00:00:00.000Z`);
    const endOfTo = new Date(`${to}T23:59:59.999Z`);

    const [paymentsSum, expensesSum, visitCount] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            appointmentId: { $in: apptIds },
            status: 'RECORDED',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Expense.aggregate([
        {
          $match: {
            status: 'APPROVED',
            spentAt: { $gte: startOfFrom, $lte: endOfTo },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Visit.countDocuments({
        appointmentId: { $in: apptIds },
      }),
    ]);

    const income = paymentsSum[0]?.total || 0;
    const expenses = expensesSum[0]?.total || 0;
    const net = income - expenses;
    const avgPerVisit = visitCount > 0 ? (income / visitCount).toFixed(2) : '0.00';

    return {
      from,
      to,
      income: String(income),
      expenses: String(expenses),
      net: String(net),
      visitCount,
      avgPerVisit,
    };
  }

  async getIncomeByDay(fromQuery?: string, toQuery?: string) {
    const today = getTodayClinicDate();
    const from = fromQuery || today.slice(0, 7) + '-01';
    const to = toQuery || today;

    const result = await Payment.aggregate([
      {
        $match: { status: 'RECORDED' },
      },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment',
        },
      },
      { $unwind: '$appointment' },
      {
        $match: {
          'appointment.clinicDate': { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: '$appointment.clinicDate',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((r) => ({
      day: r._id,
      total: String(r.total),
    }));
  }

  async getExpensesByCategory(fromQuery?: string, toQuery?: string) {
    const today = getTodayClinicDate();
    const from = fromQuery || today.slice(0, 7) + '-01';
    const to = toQuery || today;

    const startOfFrom = new Date(`${from}T00:00:00.000Z`);
    const endOfTo = new Date(`${to}T23:59:59.999Z`);

    const result = await Expense.aggregate([
      {
        $match: {
          status: 'APPROVED',
          spentAt: { $gte: startOfFrom, $lte: endOfTo },
        },
      },
      {
        $lookup: {
          from: 'expensecategories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return result.map((r) => ({
      category: r._id,
      total: String(r.total),
    }));
  }

  async getPaymentsByMethod(fromQuery?: string, toQuery?: string) {
    const today = getTodayClinicDate();
    const from = fromQuery || today.slice(0, 7) + '-01';
    const to = toQuery || today;

    const result = await Payment.aggregate([
      {
        $match: { status: 'RECORDED' },
      },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment',
        },
      },
      { $unwind: '$appointment' },
      {
        $match: {
          'appointment.clinicDate': { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: '$method',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return result.map((r) => ({
      method: r._id,
      total: String(r.total),
      count: String(r.count),
    }));
  }
}

export const reportsService = new ReportsService();

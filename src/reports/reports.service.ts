import { Injectable } from '@nestjs/common';
import { PaymentStatus, ExpenseStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(from: string, to: string) {
    const [payments, expenses, visitCount] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.RECORDED,
          appointment: { clinicDate: { gte: from, lte: to } },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.aggregate({
        where: {
          status: ExpenseStatus.APPROVED,
          spentAt: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T23:59:59.999Z`) },
        },
        _sum: { amount: true },
      }),
      this.prisma.visit.count({
        where: { appointment: { clinicDate: { gte: from, lte: to } } },
      }),
    ]);

    const income = payments._sum.amount ?? new Decimal(0);
    const exp = expenses._sum.amount ?? new Decimal(0);
    const net = new Decimal(income).minus(exp);
    const avgPerVisit = visitCount > 0 ? new Decimal(income).dividedBy(visitCount).toFixed(2) : '0.00';

    return {
      from,
      to,
      income,
      expenses: exp,
      net,
      visitCount,
      avgPerVisit,
    };
  }

  async getIncomeByDay(from: string, to: string) {
    const result = await this.prisma.$queryRaw<Array<{ day: string; total: string }>>`
      SELECT a.clinic_date as day, COALESCE(SUM(p.amount), 0) as total
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.status = 'RECORDED'
        AND a.clinic_date >= ${from}
        AND a.clinic_date <= ${to}
      GROUP BY a.clinic_date
      ORDER BY a.clinic_date ASC
    `;
    return result;
  }

  async getExpensesByCategory(from: string, to: string) {
    const result = await this.prisma.$queryRaw<Array<{ category: string; total: string }>>`
      SELECT ec.name as category, COALESCE(SUM(e.amount), 0) as total
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.status = 'APPROVED'
        AND e.spent_at >= ${new Date(`${from}T00:00:00.000Z`)}
        AND e.spent_at <= ${new Date(`${to}T23:59:59.999Z`)}
      GROUP BY ec.name
      ORDER BY total DESC
    `;
    return result;
  }

  async getPaymentsByMethod(from: string, to: string) {
    const result = await this.prisma.$queryRaw<Array<{ method: string; total: string; count: string }>>`
      SELECT p.method, COALESCE(SUM(p.amount), 0) as total, COUNT(*) as count
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.status = 'RECORDED'
        AND a.clinic_date >= ${from}
        AND a.clinic_date <= ${to}
      GROUP BY p.method
    `;
    return result;
  }
}

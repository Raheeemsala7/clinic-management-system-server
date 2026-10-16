import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, ExpenseStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { BusinessException } from 'src/common/filters/business-exception';
import { getTodayClinicDate } from 'src/common/utils/clinic-date.util';
import { CreateClosingDto } from './dto/create-closing.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class ClosingService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {}

  async getPreview(date: string) {
    const cashIn = await this.prisma.payment.aggregate({
      where: {
        appointment: { clinicDate: date },
        method: PaymentMethod.CASH,
        status: PaymentStatus.RECORDED,
      },
      _sum: { amount: true },
    });

    const cashOut = await this.prisma.expense.aggregate({
      where: {
        spentAt: { gte: new Date(`${date}T00:00:00.000Z`), lte: new Date(`${date}T23:59:59.999Z`) },
        status: ExpenseStatus.APPROVED,
        // Note: spec says "cash expenses" — we track all approved expenses as potential cash outflow
      },
      _sum: { amount: true },
    });

    const income = cashIn._sum.amount ?? new Decimal(0);
    const expenses = cashOut._sum.amount ?? new Decimal(0);
    const expectedCash = new Decimal(income).minus(expenses);

    return {
      clinicDate: date,
      totalCashPayments: income,
      totalApprovedExpenses: expenses,
      expectedCash,
    };
  }

  async close(dto: CreateClosingDto, actor: JwtPayload, ip?: string) {
    const tz = this.configService.get<string>('clinic.timezone', 'Africa/Cairo');
    const today = getTodayClinicDate(tz);

    const existing = await this.prisma.dailyClosing.findUnique({ where: { clinicDate: today } });
    if (existing && !existing.reopenedAt) {
      throw new BusinessException('ALREADY_CLOSED', 'This clinic day is already closed');
    }

    const preview = await this.getPreview(today);
    const actualCash = new Decimal(dto.actualCash);
    const difference = actualCash.minus(preview.expectedCash);

    const closing = await this.prisma.dailyClosing.upsert({
      where: { clinicDate: today },
      create: {
        clinicDate: today,
        expectedCash: preview.expectedCash,
        actualCash,
        difference,
        notes: dto.notes ?? null,
        closedById: actor.sub,
        closedAt: new Date(),
      },
      update: {
        expectedCash: preview.expectedCash,
        actualCash,
        difference,
        notes: dto.notes ?? null,
        closedById: actor.sub,
        closedAt: new Date(),
        reopenedAt: null,
        reopenedById: null,
      },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'CREATE',
      entityType: 'DailyClosing',
      entityId: closing.id,
      after: { clinicDate: today, actualCash: dto.actualCash, difference } as Record<string, unknown>,
      ip,
    });

    return closing;
  }

  async reopen(id: string, actor: JwtPayload, ip?: string) {
    const closing = await this.prisma.dailyClosing.findUnique({ where: { id } });
    if (!closing) throw new NotFoundException('Closing not found');

    const updated = await this.prisma.dailyClosing.update({
      where: { id },
      data: { reopenedAt: new Date(), reopenedById: actor.sub },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'REOPEN',
      entityType: 'DailyClosing',
      entityId: id,
      ip,
    });

    return updated;
  }
}

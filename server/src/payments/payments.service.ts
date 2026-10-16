import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { BusinessException } from 'src/common/filters/business-exception';
import { getTodayClinicDate, toClinicDate } from 'src/common/utils/clinic-date.util';
import { parsePagination, buildPaginatedResult } from 'src/common/utils/pagination.util';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VoidPaymentDto } from './dto/void-payment.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {}

  async create(appointmentId: string, dto: CreatePaymentDto, actor: JwtPayload, ip?: string) {
    const tz = this.configService.get<string>('clinic.timezone', 'Africa/Cairo');
    const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Check if the clinic day is closed
    const closed = await this.prisma.dailyClosing.findUnique({
      where: { clinicDate: appointment.clinicDate },
      select: { clinicDate: true, reopenedAt: true },
    });
    if (closed && !closed.reopenedAt) {
      throw new BusinessException(
        'DAY_CLOSED',
        'Cannot add payments for a closed clinic day',
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        appointmentId,
        patientId: appointment.patientId,
        amount: new Decimal(dto.amount),
        method: dto.method,
        kind: dto.kind,
        receivedById: actor.sub,
      },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'CREATE',
      entityType: 'Payment',
      entityId: payment.id,
      after: { amount: dto.amount, method: dto.method } as Record<string, unknown>,
      ip,
    });

    return payment;
  }

  async findAll(actor: JwtPayload, date?: string, page = 1, pageSize = 20) {
    const tz = this.configService.get<string>('clinic.timezone', 'Africa/Cairo');
    const today = getTodayClinicDate(tz);

    // Reception can only see today's payments
    if (actor.role === Role.RECEPTION && date && date !== today) {
      throw new ForbiddenException({ error: { code: 'FORBIDDEN', message: 'Reception can only view today\'s payments' } });
    }
    const effectiveDate = actor.role === Role.RECEPTION ? today : date;

    const { skip, take } = parsePagination({ page, pageSize });

    let where = {};
    if (effectiveDate) {
      // Filter by payments whose appointments are on the given clinic date
      where = {
        appointment: { clinicDate: effectiveDate },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: { select: { clinicDate: true, type: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, pageSize);
  }

  async voidPayment(id: string, dto: VoidPaymentDto, actor: JwtPayload, ip?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.VOIDED) {
      throw new BusinessException('ALREADY_VOIDED', 'Payment is already voided');
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.VOIDED,
        voidReason: dto.reason,
        voidedById: actor.sub,
      },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'VOID',
      entityType: 'Payment',
      entityId: id,
      before: { status: PaymentStatus.RECORDED } as Record<string, unknown>,
      after: { status: PaymentStatus.VOIDED, reason: dto.reason } as Record<string, unknown>,
      ip,
    });

    return updated;
  }
}

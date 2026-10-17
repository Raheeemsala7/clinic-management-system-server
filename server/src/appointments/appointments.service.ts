import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AppointmentStatus, AppointmentSource, Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { RealtimeService } from 'src/realtime/realtime.service';
import { getTodayClinicDate } from 'src/common/utils/clinic-date.util';
import { parsePagination, buildPaginatedResult } from 'src/common/utils/pagination.util';
import { BusinessException } from 'src/common/filters/business-exception';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

/** Prisma interactive transaction client — must match what Prisma passes into the callback */
type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Allowed status transitions per the spec state machine
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  BOOKED: [AppointmentStatus.WAITING, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
  WAITING: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED, AppointmentStatus.WAITING],
  IN_PROGRESS: [AppointmentStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private configService: ConfigService,
    private realtimeService: RealtimeService,
  ) {}

  async create(dto: CreateAppointmentDto, actor: JwtPayload, ip?: string) {
    const tz = this.configService.get<string>('clinic.timezone', 'Africa/Cairo');
    const clinicDate = getTodayClinicDate(tz);

    // Verify doctor exists
    const doctor = await this.prisma.user.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor || doctor.role !== 'DOCTOR') throw new NotFoundException('Doctor not found');

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId, deletedAt: null },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // SCHEDULED appointments need scheduledAt
    if (dto.source === AppointmentSource.SCHEDULED && !dto.scheduledAt) {
      throw new ConflictException({
        error: {
          code: 'SCHEDULED_AT_REQUIRED',
          message: 'scheduledAt is required for SCHEDULED appointments',
        },
      });
    }

    // Guard: no duplicate active appointment on the same clinic day
    const activeCount = await this.prisma.appointment.count({
      where: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        clinicDate,
        status: {
          in: [
            AppointmentStatus.BOOKED,
            AppointmentStatus.WAITING,
            AppointmentStatus.IN_PROGRESS,
          ],
        },
      },
    });
    if (activeCount > 0) {
      throw new BusinessException(
        'DUPLICATE_ACTIVE_APPOINTMENT',
        'Patient already has an active appointment today with this doctor',
      );
    }

    // Queue number: per doctor per clinic day, starting at 1
    const lastQueue = await this.prisma.appointment.findFirst({
      where: { doctorId: dto.doctorId, clinicDate },
      orderBy: { queueNumber: 'desc' },
      select: { queueNumber: true },
    });
    const queueNumber = (lastQueue?.queueNumber ?? 0) + 1;

    // queueOrder: initially sequential; postpone moves it to the end
    const lastOrder = await this.prisma.appointment.findFirst({
      where: { doctorId: dto.doctorId, clinicDate },
      orderBy: { queueOrder: 'desc' },
      select: { queueOrder: true },
    });
    const queueOrder = (lastOrder?.queueOrder ?? 0) + 1;

    // Walk-ins start immediately at WAITING
    const initialStatus =
      dto.source === AppointmentSource.WALK_IN
        ? AppointmentStatus.WAITING
        : AppointmentStatus.BOOKED;

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        clinicDate,
        source: dto.source,
        type: dto.type,
        status: initialStatus,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        queueNumber,
        queueOrder,
        arrivedAt: dto.source === AppointmentSource.WALK_IN ? new Date() : null,
        createdById: actor.sub,
      },
      include: { patient: { select: { fullName: true } } },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'CREATE',
      entityType: 'Appointment',
      entityId: appointment.id,
      after: { status: initialStatus, clinicDate } as Record<string, unknown>,
      ip,
    });

    // Emit queue update after commit
    await this.realtimeService.emitQueueUpdated(dto.doctorId, tz);

    return appointment;
  }

  async findAll(
    actor: JwtPayload,
    query: {
      date?: string;
      status?: AppointmentStatus;
      doctorId?: string;
      page: number;
      pageSize: number;
    },
  ) {
    const { skip, take } = parsePagination({ page: query.page, pageSize: query.pageSize });
    const where: Prisma.AppointmentWhereInput = {
      ...(query.date && { clinicDate: query.date }),
      ...(query.status && { status: query.status }),
      ...(query.doctorId && { doctorId: query.doctorId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: [{ clinicDate: 'desc' }, { queueOrder: 'asc' }],
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              gender: true,
              dateOfBirth: true,
            },
          },
          doctor: { select: { id: true, name: true } },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        doctor: { select: { id: true, name: true } },
        visit: true,
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async transition(
    id: string,
    action: 'arrive' | 'start' | 'complete' | 'cancel' | 'no-show' | 'postpone',
    actor: JwtPayload,
    ip?: string,
  ) {
    const tz = this.configService.get<string>('clinic.timezone', 'Africa/Cairo');

    const result = await this.prisma.$transaction(async (tx: TxClient) => {
      // Row-level lock to prevent race conditions
      const rows = await tx.$queryRaw<
        Array<{
          id: string;
          status: string;
          doctorId: string;
          queueOrder: number;
          patientId: string;
          clinicDate: string;
        }>
      >`SELECT id, status, "doctorId", "queueOrder", "patientId", "clinicDate"
        FROM appointments WHERE id = ${id} FOR UPDATE`;

      const row = rows[0];
      if (!row) throw new NotFoundException('Appointment not found');

      const current = row.status as AppointmentStatus;
      const targetStatus = this.actionToStatus(action);

      // Idempotency: already in desired terminal/same state → return current state
      if (current === targetStatus && action !== 'postpone') {
        return tx.appointment.findUnique({ where: { id } });
      }

      // Validate transition
      if (!TRANSITIONS[current].includes(targetStatus)) {
        throw new BusinessException(
          'INVALID_TRANSITION',
          `Cannot perform action '${action}' on appointment in status '${current}'`,
        );
      }

      // Only one IN_PROGRESS per doctor at a time
      if (targetStatus === AppointmentStatus.IN_PROGRESS) {
        const busy = await tx.appointment.count({
          where: {
            doctorId: row.doctorId,
            status: AppointmentStatus.IN_PROGRESS,
          },
        });
        if (busy > 0) {
          throw new BusinessException(
            'DOCTOR_BUSY',
            'Doctor already has a patient in progress',
          );
        }
      }

      const now = new Date();
      const updateData: Prisma.AppointmentUpdateInput = { status: targetStatus };

      if (action === 'arrive') updateData.arrivedAt = now;
      if (action === 'start') updateData.startedAt = now;
      if (action === 'complete') updateData.completedAt = now;
      if (action === 'cancel') updateData.cancelledAt = now;

      if (action === 'postpone') {
        // Move to end of the WAITING queue for the day
        const maxOrder = await tx.appointment.aggregate({
          where: {
            doctorId: row.doctorId,
            clinicDate: row.clinicDate,
            status: AppointmentStatus.WAITING,
          },
          _max: { queueOrder: true },
        });
        updateData.queueOrder = (maxOrder._max.queueOrder ?? row.queueOrder) + 1;
        updateData.postponedCount = { increment: 1 };
        // status stays WAITING — already set above
      }

      const updated = await tx.appointment.update({ where: { id }, data: updateData });

      // Starting → create the Visit, set DoctorStatus to WITH_PATIENT
      if (action === 'start') {
        await tx.visit.create({
          data: {
            appointmentId: id,
            patientId: row.patientId,
            doctorId: row.doctorId,
          },
        });
        await tx.doctorStatus.upsert({
          where: { doctorId: row.doctorId },
          create: { doctorId: row.doctorId, status: 'WITH_PATIENT' },
          update: { status: 'WITH_PATIENT' },
        });
      }

      // Completing → close any open Visit, set DoctorStatus to AVAILABLE
      if (action === 'complete') {
        await tx.visit.updateMany({
          where: { appointmentId: id, status: 'OPEN' },
          data: { status: 'CLOSED', closedAt: now },
        });
        await tx.doctorStatus.upsert({
          where: { doctorId: row.doctorId },
          create: { doctorId: row.doctorId, status: 'AVAILABLE' },
          update: { status: 'AVAILABLE' },
        });
      }

      await this.auditService.log({
        userId: actor.sub,
        action: 'UPDATE',
        entityType: 'Appointment',
        entityId: id,
        before: { status: current } as Record<string, unknown>,
        after: { status: targetStatus } as Record<string, unknown>,
        ip,
      });

      return updated;
    });

    // ── Post-transaction: emit realtime events ──────────────────────────────
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: { select: { fullName: true } } },
    });

    if (appt) {
      await this.realtimeService.emitQueueUpdated(appt.doctorId, tz);

      if (action === 'complete') {
        await this.realtimeService.emitAppointmentCompleted({
          appointmentId: id,
          patientName: appt.patient.fullName,
          queueNumber: appt.queueNumber,
        });
        await this.realtimeService.emitDoctorStatusChanged(appt.doctorId);
      }

      if (action === 'start') {
        await this.realtimeService.emitNextPatient({
          appointmentId: id,
          patientId: appt.patientId,
        });
        await this.realtimeService.emitDoctorStatusChanged(appt.doctorId);
      }
    }

    return result;
  }

  private actionToStatus(action: string): AppointmentStatus {
    const map: Record<string, AppointmentStatus> = {
      arrive: AppointmentStatus.WAITING,
      start: AppointmentStatus.IN_PROGRESS,
      complete: AppointmentStatus.COMPLETED,
      cancel: AppointmentStatus.CANCELLED,
      'no-show': AppointmentStatus.NO_SHOW,
      postpone: AppointmentStatus.WAITING,
    };
    const status = map[action];
    if (!status) {
      throw new BusinessException('INVALID_ACTION', `Unknown action: ${action}`);
    }
    return status;
  }
}

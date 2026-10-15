import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AppointmentStatus, AppointmentSource, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { RealtimeService } from 'src/realtime/realtime.service';
import { getTodayClinicDate } from 'src/common/utils/clinic-date.util';
import { parsePagination, buildPaginatedResult } from 'src/common/utils/pagination.util';
import { BusinessException } from 'src/common/filters/business-exception';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

// Allowed status transitions
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

    // Check doctor exists
    const doctor = await this.prisma.user.findUnique({ where: { id: dto.doctorId, role: 'DOCTOR' } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Check patient exists
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId, deletedAt: null } });
    if (!patient) throw new NotFoundException('Patient not found');

    // Validate SCHEDULED requires scheduledAt
    if (dto.source === AppointmentSource.SCHEDULED && !dto.scheduledAt) {
      throw new ConflictException({
        error: { code: 'SCHEDULED_AT_REQUIRED', message: 'scheduledAt is required for SCHEDULED appointments' },
      });
    }

    // Check for duplicate active appointment
    const activeCount = await this.prisma.appointment.count({
      where: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        clinicDate,
        status: { in: [AppointmentStatus.BOOKED, AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS] },
      },
    });
    if (activeCount > 0) {
      throw new BusinessException(
        'DUPLICATE_ACTIVE_APPOINTMENT',
        'Patient already has an active appointment today',
      );
    }

    // Assign queue number (per doctor per clinic day)
    const lastQueue = await this.prisma.appointment.findFirst({
      where: { doctorId: dto.doctorId, clinicDate },
      orderBy: { queueNumber: 'desc' },
      select: { queueNumber: true },
    });
    const queueNumber = (lastQueue?.queueNumber ?? 0) + 1;

    // queueOrder for walk-ins starts after all existing appointments
    const lastOrder = await this.prisma.appointment.findFirst({
      where: { doctorId: dto.doctorId, clinicDate },
      orderBy: { queueOrder: 'desc' },
      select: { queueOrder: true },
    });
    const queueOrder = (lastOrder?.queueOrder ?? 0) + 1;

    const initialStatus =
      dto.source === AppointmentSource.WALK_IN ? AppointmentStatus.WAITING : AppointmentStatus.BOOKED;

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
      after: { ...appointment } as Record<string, unknown>,
      ip,
    });

    // Emit queue updated event
    await this.realtimeService.emitQueueUpdated(dto.doctorId, tz);

    return appointment;
  }

  async findAll(
    actor: JwtPayload,
    query: { date?: string; status?: AppointmentStatus; doctorId?: string; page: number; pageSize: number },
  ) {
    const { skip, take } = parsePagination({ page: query.page, pageSize: query.pageSize });
    const where = {
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
        patient: { select: { id: true, fullName: true, phone: true, gender: true, dateOfBirth: true } },
        doctor: { select: { id: true, name: true } },
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

    // Use a transaction for idempotent, safe transitions
    return this.prisma.$transaction(async (tx) => {
      // Row-level lock
      const appointments = await tx.$queryRaw<Array<{ id: string; status: string; doctorId: string; queueOrder: number; patientId: string }>>`
        SELECT id, status, "doctorId", "queueOrder", "patientId" FROM appointments WHERE id = ${id} FOR UPDATE
      `;
      const appointment = appointments[0];
      if (!appointment) throw new NotFoundException('Appointment not found');

      const current = appointment.status as AppointmentStatus;
      const targetStatus = this.actionToStatus(action, current);

      // Idempotency: if already in the target state, return current
      if (current === targetStatus) {
        const full = await tx.appointment.findUnique({ where: { id } });
        return full;
      }

      // Validate transition
      if (!TRANSITIONS[current].includes(targetStatus)) {
        throw new BusinessException(
          'INVALID_TRANSITION',
          `Cannot transition from ${current} to ${targetStatus} (action: ${action})`,
        );
      }

      // DOCTOR_BUSY check: only one IN_PROGRESS at a time
      if (targetStatus === AppointmentStatus.IN_PROGRESS) {
        const busy = await tx.appointment.count({
          where: { doctorId: appointment.doctorId, status: AppointmentStatus.IN_PROGRESS },
        });
        if (busy > 0) {
          throw new BusinessException('DOCTOR_BUSY', 'Doctor already has a patient in progress');
        }
      }

      const now = new Date();
      const updateData: Record<string, unknown> = { status: targetStatus };

      if (targetStatus === AppointmentStatus.WAITING) updateData.arrivedAt = now;
      if (targetStatus === AppointmentStatus.IN_PROGRESS) updateData.startedAt = now;
      if (targetStatus === AppointmentStatus.COMPLETED) updateData.completedAt = now;
      if (targetStatus === AppointmentStatus.CANCELLED) updateData.cancelledAt = now;

      if (action === 'postpone') {
        // Move to end of WAITING queue
        const maxOrder = await tx.appointment.aggregate({
          where: { doctorId: appointment.doctorId, clinicDate: await this.getClinicDate(id, tx), status: AppointmentStatus.WAITING },
          _max: { queueOrder: true },
        });
        updateData.queueOrder = (maxOrder._max.queueOrder ?? appointment.queueOrder) + 1;
        updateData.postponedCount = { increment: 1 };
        updateData.status = AppointmentStatus.WAITING; // stays WAITING
      }

      const updated = await tx.appointment.update({ where: { id }, data: updateData });

      // If starting, create the Visit and update DoctorStatus
      if (targetStatus === AppointmentStatus.IN_PROGRESS) {
        await tx.visit.create({
          data: {
            appointmentId: id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
          },
        });
        await tx.doctorStatus.upsert({
          where: { doctorId: appointment.doctorId },
          create: { doctorId: appointment.doctorId, status: 'WITH_PATIENT' },
          update: { status: 'WITH_PATIENT' },
        });
      }

      // If completing, close Visit if open and set doctor AVAILABLE
      if (targetStatus === AppointmentStatus.COMPLETED) {
        await tx.visit.updateMany({
          where: { appointmentId: id, status: 'OPEN' },
          data: { status: 'CLOSED', closedAt: now },
        });
        await tx.doctorStatus.upsert({
          where: { doctorId: appointment.doctorId },
          create: { doctorId: appointment.doctorId, status: 'AVAILABLE' },
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
    }).then(async (updated) => {
      // After transaction commits, emit events
      const appt = await this.prisma.appointment.findUnique({
        where: { id },
        include: { patient: { select: { fullName: true } } },
      });
      if (!appt) return updated;

      await this.realtimeService.emitQueueUpdated(appt.doctorId, tz);

      if (action === 'complete') {
        await this.realtimeService.emitAppointmentCompleted({
          appointmentId: id,
          patientName: appt.patient.fullName,
          queueNumber: appt.queueNumber,
        });
      }

      if (action === 'start') {
        await this.realtimeService.emitNextPatient({
          appointmentId: id,
          patientId: appt.patientId,
        });
      }

      if (action === 'arrive' || action === 'start' || action === 'complete') {
        await this.realtimeService.emitDoctorStatusChanged(appt.doctorId);
      }

      return updated;
    });
  }

  private actionToStatus(
    action: string,
    current: AppointmentStatus,
  ): AppointmentStatus {
    switch (action) {
      case 'arrive': return AppointmentStatus.WAITING;
      case 'start': return AppointmentStatus.IN_PROGRESS;
      case 'complete': return AppointmentStatus.COMPLETED;
      case 'cancel': return AppointmentStatus.CANCELLED;
      case 'no-show': return AppointmentStatus.NO_SHOW;
      case 'postpone': return AppointmentStatus.WAITING;
      default: throw new BusinessException('INVALID_ACTION', `Unknown action: ${action}`);
    }
  }

  private async getClinicDate(appointmentId: string, tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]): Promise<string> {
    const appt = await tx.appointment.findUnique({
      where: { id: appointmentId },
      select: { clinicDate: true },
    });
    return appt?.clinicDate ?? '';
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { getTodayClinicDate } from 'src/common/utils/clinic-date.util';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  // Gateway reference injected after gateway is created (avoid circular dep)
  private gateway: { emitToRole: (role: string, event: string, payload: unknown) => void } | null = null;

  setGateway(gw: { emitToRole: (role: string, event: string, payload: unknown) => void }) {
    this.gateway = gw;
  }

  constructor(private prisma: PrismaService) {}

  async emitQueueUpdated(doctorId: string, tz: string) {
    if (!this.gateway) return;
    const today = getTodayClinicDate(tz);
    const queue = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        clinicDate: today,
        status: { in: [AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS, AppointmentStatus.BOOKED] },
      },
      orderBy: { queueOrder: 'asc' },
      include: { patient: { select: { id: true, fullName: true } } },
    });

    const payload = queue.map((a) => ({
      id: a.id,
      queueNumber: a.queueNumber,
      queueOrder: a.queueOrder,
      status: a.status,
      patientName: a.patient.fullName,
      postponedCount: a.postponedCount,
    }));

    // Send to all roles (no financial/medical data in this payload)
    this.gateway.emitToRole('ADMIN', 'queue.updated', payload);
    this.gateway.emitToRole('DOCTOR', 'queue.updated', payload);
    this.gateway.emitToRole('RECEPTION', 'queue.updated', payload);
  }

  async emitAppointmentCompleted(payload: {
    appointmentId: string;
    patientName: string;
    queueNumber: number;
  }) {
    if (!this.gateway) return;
    this.gateway.emitToRole('RECEPTION', 'appointment.completed', payload);
    this.gateway.emitToRole('ADMIN', 'appointment.completed', payload);
  }

  async emitNextPatient(payload: { appointmentId: string; patientId: string }) {
    if (!this.gateway) return;
    this.gateway.emitToRole('DOCTOR', 'next.patient', payload);
  }

  async emitDoctorStatusChanged(doctorId: string) {
    if (!this.gateway) return;
    const status = await this.prisma.doctorStatus.findUnique({ where: { doctorId } });
    const payload = { doctorId, status: status?.status ?? 'AVAILABLE' };
    this.gateway.emitToRole('ADMIN', 'doctor.status.changed', payload);
    this.gateway.emitToRole('DOCTOR', 'doctor.status.changed', payload);
    this.gateway.emitToRole('RECEPTION', 'doctor.status.changed', payload);
  }
}

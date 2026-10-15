import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { getTodayClinicDate } from 'src/common/utils/clinic-date.util';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class QueueService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getTodayQueue(doctorId: string, _actor: JwtPayload) {
    const tz = this.configService.get<string>('clinic.timezone', 'Africa/Cairo');
    const today = getTodayClinicDate(tz);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        clinicDate: today,
        status: {
          in: [
            AppointmentStatus.WAITING,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.BOOKED,
          ],
        },
      },
      orderBy: { queueOrder: 'asc' },
      include: {
        patient: {
          select: { id: true, fullName: true, gender: true, dateOfBirth: true },
        },
      },
    });

    const now = new Date();
    return appointments.map((appt) => ({
      id: appt.id,
      queueNumber: appt.queueNumber,
      queueOrder: appt.queueOrder,
      status: appt.status,
      source: appt.source,
      type: appt.type,
      postponedCount: appt.postponedCount,
      patientId: appt.patient.id,
      patientName: appt.patient.fullName,
      waitingMinutes: appt.arrivedAt
        ? Math.floor((now.getTime() - appt.arrivedAt.getTime()) / 60000)
        : null,
    }));
  }

  async getDoctorStatus(doctorId: string) {
    const status = await this.prisma.doctorStatus.findUnique({ where: { doctorId } });
    return status ?? { doctorId, status: 'AVAILABLE', updatedAt: new Date() };
  }

  async setDoctorStatus(doctorId: string, newStatus: 'AVAILABLE' | 'BREAK') {
    return this.prisma.doctorStatus.upsert({
      where: { doctorId },
      create: { doctorId, status: newStatus },
      update: { status: newStatus },
    });
  }
}

import { Appointment, DoctorStatus, Patient, Visit, User } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { BadRequestError, ValidationError } from '../utils/errors';

export class QueueService {
  static async getTodayQueue(doctorId?: string) {
    let targetDoctorId = doctorId;
    if (!targetDoctorId) {
      const activeDoctor = await User.findOne({ role: 'DOCTOR', isActive: true, deletedAt: null });
      if (activeDoctor) {
        targetDoctorId = activeDoctor.id;
      }
    }

    const today = getTodayClinicDate();

    const filter: any = {
      clinicDate: today,
      status: { $in: ['WAITING', 'IN_PROGRESS', 'BOOKED'] },
    };
    if (targetDoctorId) {
      filter.doctorId = targetDoctorId;
    }

    const appointments = await Appointment.find(filter).sort({ queueOrder: 1 });

    const now = Date.now();
    return Promise.all(
      appointments.map(async (appt) => {
        const [patient, doctor, visit] = await Promise.all([
          Patient.findById(appt.patientId).select('id fullName phone gender age dateOfBirth'),
          User.findById(appt.doctorId).select('id name'),
          Visit.findOne({ appointmentId: appt.id }).select('id status'),
        ]);

        const waitingMinutes = appt.arrivedAt
          ? Math.floor((now - new Date(appt.arrivedAt).getTime()) / 60000)
          : null;

        return {
          id: appt.id,
          queueNumber: appt.queueNumber,
          queueOrder: appt.queueOrder,
          status: appt.status,
          source: appt.source,
          type: appt.type,
          startTime: appt.startTime,
          scheduledAt: appt.scheduledAt,
          arrivedAt: appt.arrivedAt,
          postponedCount: appt.postponedCount || 0,
          patientId: appt.patientId,
          patientName: patient?.fullName || 'Unknown',
          patientPhone: patient?.phone || '',
          patientGender: patient?.gender,
          patientAge: patient?.age,
          doctorId: appt.doctorId,
          doctorName: doctor?.name || '',
          visitId: visit?.id || null,
          waitingMinutes,
          totalAmount: appt.totalAmount,
          paidAmount: appt.paidAmount,
          remainingAmount: appt.remainingAmount,
          paymentStatus: appt.paymentStatus,
          isExempt: appt.isExempt,
        };
      }),
    );
  }

  static async getDoctorStatus(doctorId?: string) {
    let targetDoctorId = doctorId;
    if (!targetDoctorId) {
      const activeDoctor = await User.findOne({ role: 'DOCTOR', isActive: true, deletedAt: null });
      if (activeDoctor) {
        targetDoctorId = activeDoctor.id;
      }
    }

    if (!targetDoctorId) {
      return {
        doctorId: '',
        status: 'AVAILABLE',
        updatedAt: new Date().toISOString(),
      };
    }

    const docStatus = await DoctorStatus.findById(targetDoctorId);
    if (!docStatus) {
      return {
        doctorId: targetDoctorId,
        status: 'AVAILABLE',
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      doctorId: targetDoctorId,
      status: docStatus.status,
      updatedAt: docStatus.updatedAt ? docStatus.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  static async setDoctorStatus(doctorId: string, status?: string) {
    if (!status || !['AVAILABLE', 'BREAK'].includes(status)) {
      throw new ValidationError('Validation failed', [
        { path: 'status', message: 'Status must be AVAILABLE or BREAK' },
      ]);
    }

    const docStatus = await DoctorStatus.findByIdAndUpdate(
      doctorId,
      { _id: doctorId, status },
      { upsert: true, returnDocument: 'after' },
    );

    return {
      doctorId,
      status: docStatus.status,
      updatedAt: docStatus.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}

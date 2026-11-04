import { Appointment, DoctorStatus, Patient, Visit, User } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { BadRequestError, ValidationError } from '../utils/errors';

export class QueueService {
  static async getTodayQueue(doctorId?: string) {
    const today = getTodayClinicDate();

    const filter: any = {
      clinicDate: today,
      status: { $in: ['WAITING', 'IN_PROGRESS', 'BOOKED', 'PENDING_CHECKOUT'] },
    };
    // إذا تم تمرير معرف طبيب محدد، يتم الفلترة عليه، وإذا لم يُرسل يتم جلب طابور جميع أطباء العيادة
    if (doctorId) {
      filter.doctorId = doctorId;
    }

    const appointments = await Appointment.find(filter).sort({ queueOrder: 1, arrivedAt: 1, createdAt: 1 });

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

        const remaining = Boolean(appt.isExempt) ? 0 : Math.max(0, appt.remainingAmount || 0);
        const isPaid = Boolean(appt.isExempt) || appt.paymentStatus === 'PAID' || (appt.totalAmount > 0 && remaining === 0);
        const hasRem = !appt.isExempt && remaining > 0;

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
          totalAmount: appt.totalAmount || 0,
          paidAmount: appt.paidAmount || 0,
          remainingAmount: remaining,
          paymentStatus: appt.paymentStatus || 'UNPAID',
          isFullyPaid: isPaid,
          hasRemaining: hasRem,
          isExempt: Boolean(appt.isExempt),
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

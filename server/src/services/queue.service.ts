import { Appointment, DoctorStatus, Patient, Visit } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { BadRequestError } from '../utils/errors';

export class QueueService {
  static async getTodayQueue(doctorId?: string) {
    if (!doctorId) {
      throw new BadRequestError('doctorId is required');
    }

    const today = getTodayClinicDate();

    const appointments = await Appointment.find({
      doctorId,
      clinicDate: today,
      status: { $in: ['WAITING', 'IN_PROGRESS', 'BOOKED'] },
    }).sort({ queueOrder: 1 });

    const now = Date.now();
    return Promise.all(
      appointments.map(async (appt) => {
        const [patient, visit] = await Promise.all([
          Patient.findById(appt.patientId).select('id fullName'),
          Visit.findOne({ appointmentId: appt.id }).select('id'),
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
          postponedCount: appt.postponedCount || 0,
          patientId: appt.patientId,
          patientName: patient?.fullName || 'Unknown',
          visitId: visit?.id || null,
          waitingMinutes,
        };
      }),
    );
  }

  static async getDoctorStatus(doctorId?: string) {
    if (!doctorId) {
      throw new BadRequestError('doctorId is required');
    }

    const docStatus = await DoctorStatus.findById(doctorId);
    if (!docStatus) {
      return {
        doctorId,
        status: 'AVAILABLE',
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      doctorId,
      status: docStatus.status,
      updatedAt: docStatus.updatedAt ? docStatus.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  static async setDoctorStatus(doctorId: string, status?: string) {
    if (!status || !['AVAILABLE', 'BREAK'].includes(status)) {
      throw new BadRequestError('Status must be AVAILABLE or BREAK');
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

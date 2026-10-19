import { Appointment, Patient, User, Visit, DoctorStatus } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';
import { DoctorScheduleService } from './doctor-schedule.service';

const TRANSITIONS: Record<string, string[]> = {
  BOOKED: ['WAITING', 'CANCELLED', 'NO_SHOW'],
  WAITING: ['IN_PROGRESS', 'CANCELLED', 'WAITING'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export class AppointmentsService {
  static async createAppointment(dto: any, actor: { id: string }, ip = '') {
    const { patientId, doctorId, source, type, scheduledAt, startTime, endTime, notes } = dto;
    const today = getTodayClinicDate();
    const clinicDate = dto.clinicDate || today;

    if (clinicDate < today) {
      throw new BadRequestError('لا يمكن حجز موعد في تاريخ ماضٍ');
    }

    if (!patientId || !doctorId || !source || !type) {
      throw new BadRequestError('patientId, doctorId, source, and type are required');
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR', deletedAt: null, isActive: true });
    if (!doctor) throw new NotFoundError('Doctor not found');

    const patient = await Patient.findOne({ _id: patientId, deletedAt: null });
    if (!patient) throw new NotFoundError('Patient not found');

    if (source === 'SCHEDULED') {
      if (!scheduledAt && !startTime) {
        throw new ConflictError('scheduledAt or startTime is required for SCHEDULED appointments', 'SCHEDULED_AT_REQUIRED');
      }

      // Check doctor availability for the requested day
      const slotsInfo = await DoctorScheduleService.getAvailableSlots(doctorId, clinicDate);
      if (!slotsInfo.isWorkingDay) {
        throw new BadRequestError(slotsInfo.message || 'الطبيب غير متاح في هذا التاريخ');
      }
    }

    const activeCount = await Appointment.countDocuments({
      patientId,
      doctorId,
      clinicDate,
      status: { $in: ['BOOKED', 'WAITING', 'IN_PROGRESS'] },
    });
    if (activeCount > 0) {
      throw new ConflictError('Patient already has an active appointment today with this doctor', 'DUPLICATE_ACTIVE_APPOINTMENT');
    }

    const lastAppt = await Appointment.findOne({ doctorId, clinicDate }).sort({ queueNumber: -1 });
    const queueNumber = (lastAppt?.queueNumber || 0) + 1;

    const lastOrder = await Appointment.findOne({ doctorId, clinicDate }).sort({ queueOrder: -1 });
    const queueOrder = (lastOrder?.queueOrder || 0) + 1;

    const initialStatus = source === 'WALK_IN' ? 'WAITING' : 'BOOKED';
    const now = new Date();

    // Financial calculationsddd
    const isExempt = Boolean(dto.isExempt)
    const exemptionReason = dto.exemptionReason || null;
    let totalAmount = isExempt ? 0 : Math.max(0, Number(dto.totalAmount || 0));
    let paidAmount = isExempt ? 0 : Math.max(0, Number(dto.paidAmount || 0));
    if (paidAmount > totalAmount && totalAmount > 0) {
      paidAmount = totalAmount;
    }
    const remainingAmount = isExempt ? 0 : Math.max(0, totalAmount - paidAmount);

    let paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT' = 'UNPAID';
    if (isExempt) {
      paymentStatus = 'EXEMPT';
    } else if (remainingAmount === 0 && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'UNPAID';
    }

    let parsedScheduledAt: Date | null = null;
    if (scheduledAt) {
      parsedScheduledAt = new Date(scheduledAt);
    } else if (startTime && clinicDate) {
      parsedScheduledAt = new Date(`${clinicDate}T${startTime}:00.000Z`);
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      clinicDate,
      source,
      type,
      status: initialStatus,
      scheduledAt: parsedScheduledAt,
      startTime: startTime || null,
      endTime: endTime || null,
      queueNumber,
      queueOrder,
      arrivedAt: source === 'WALK_IN' ? now : null,
      totalAmount,
      paidAmount,
      remainingAmount,
      paymentStatus,
      isExempt,
      exemptionReason,
      notes: notes || null,
      createdById: actor.id,
    });

    // Automatically create a payment entry if any deposit or full amount was paid upfront
    if (paidAmount > 0 && !isExempt) {
      const { Payment } = await import('../models');
      await Payment.create({
        appointmentId: appointment.id,
        patientId,
        amount: paidAmount,
        method: dto.paymentMethod || 'CASH',
        kind: type === 'CONSULTATION' ? 'CONSULTATION' : 'FOLLOW_UP',
        paymentType: paidAmount < totalAmount ? 'DEPOSIT' : 'FULL',
        notes: paidAmount < totalAmount
          ? `عربون حجز موعد - متبقي ${remainingAmount} ج.م`
          : 'سداد كامل لقيمة الحجز',
        receivedById: actor.id,
        status: 'RECORDED',
      });
    }

    await logAudit({
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Appointment',
      entityId: appointment.id,
      after: {
        status: initialStatus,
        clinicDate,
        queueNumber,
        totalAmount,
        paidAmount,
        remainingAmount,
        paymentStatus,
        isExempt,
      },
      ip,
    });

    return {
      ...appointment.toJSON(),
      patient: { fullName: patient.fullName, phone: patient.phone },
      doctor: { id: doctor.id, name: doctor.name },
    };
  }

  static async listAppointments(query: any) {
    const { date, from, to, status, doctorId, page: pageQuery, pageSize: pageSizeQuery } = query;
    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    const filter: any = {};
    if (from || to) {
      filter.clinicDate = {};
      if (from) filter.clinicDate.$gte = from;
      if (to) filter.clinicDate.$lte = to;
    } else if (date) {
      filter.clinicDate = date;
    }
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ clinicDate: -1, startTime: 1, queueOrder: 1 })
        .skip(skip)
        .limit(take),
      Appointment.countDocuments(filter),
    ]);

    const populated = await Promise.all(
      appointments.map(async (appt) => {
        const [patient, doctor, visit] = await Promise.all([
          Patient.findById(appt.patientId).select('id fullName phone gender dateOfBirth'),
          User.findById(appt.doctorId).select('id name'),
          Visit.findOne({ appointmentId: appt.id }).select('id status'),
        ]);

        return {
          ...appt.toJSON(),
          patient: patient ? patient.toJSON() : null,
          doctor: doctor ? doctor.toJSON() : null,
          visit: visit ? visit.toJSON() : null,
        };
      }),
    );

    return buildPaginatedResult(populated, total, page, pageSize);
  }

  static async payRemaining(
    appointmentId: string,
    dto: { amount?: number; method?: 'CASH' | 'CARD' | 'WALLET'; notes?: string },
    actor: { id: string },
    ip = '',
  ) {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new NotFoundError('Appointment not found');

    if (appt.isExempt) {
      throw new BadRequestError('هذا الموعد معفي من الرسوم');
    }

    if (appt.remainingAmount <= 0) {
      throw new BadRequestError('المبلغ مدفوع بالكامل مسبقاً');
    }

    const payAmount = Number(dto.amount !== undefined ? dto.amount : appt.remainingAmount);
    if (payAmount <= 0) {
      throw new BadRequestError('المبلغ المدفوع يجب أن يكون أكبر من صفر');
    }

    appt.paidAmount = appt.paidAmount + payAmount;
    appt.remainingAmount = Math.max(0, appt.totalAmount - appt.paidAmount);
    appt.paymentStatus = appt.remainingAmount === 0 ? 'PAID' : 'PARTIAL';
    await appt.save();

    const { Payment } = await import('../models');
    const payment = await Payment.create({
      appointmentId: appt.id,
      patientId: appt.patientId,
      amount: payAmount,
      method: dto.method || 'CASH',
      kind: appt.type,
      paymentType: 'REMAINING',
      notes:
        dto.notes ||
        (appt.remainingAmount === 0
          ? 'سداد كامل للمبلغ المتبقي'
          : `سداد دفعة متبقية - باقي ${appt.remainingAmount} ج.م`),
      receivedById: actor.id,
      status: 'RECORDED',
    });

    await logAudit({
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Payment',
      entityId: payment.id,
      after: { amount: payAmount, remainingAmount: appt.remainingAmount, appointmentId: appt.id },
      ip,
    });

    return {
      appointment: appt.toJSON(),
      payment: payment.toJSON(),
    };
  }

  static async getAppointmentById(id: string) {
    const appt = await Appointment.findById(id);
    if (!appt) throw new NotFoundError('Appointment not found');

    const [patient, doctor, visit] = await Promise.all([
      Patient.findById(appt.patientId).select('id fullName phone gender dateOfBirth'),
      User.findById(appt.doctorId).select('id name'),
      Visit.findOne({ appointmentId: appt.id }),
    ]);

    return {
      ...appt.toJSON(),
      patient: patient ? patient.toJSON() : null,
      doctor: doctor ? doctor.toJSON() : null,
      visit: visit ? visit.toJSON() : null,
    };
  }

  static async transition(
    id: string,
    action: 'arrive' | 'start' | 'complete' | 'cancel' | 'no-show' | 'postpone',
    actor: { id: string },
    ip = '',
  ) {
    const appt = await Appointment.findById(id);
    if (!appt) throw new NotFoundError('Appointment not found');

    const actionMap: Record<string, string> = {
      arrive: 'WAITING',
      start: 'IN_PROGRESS',
      complete: 'COMPLETED',
      cancel: 'CANCELLED',
      'no-show': 'NO_SHOW',
      postpone: 'WAITING',
    };

    const targetStatus = actionMap[action];
    const currentStatus = appt.status;

    if (currentStatus === targetStatus && action !== 'postpone') {
      return appt.toJSON();
    }

    const allowed = TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new ConflictError(
        `Cannot perform action '${action}' on appointment in status '${currentStatus}'`,
        'INVALID_TRANSITION',
      );
    }

    if (targetStatus === 'IN_PROGRESS') {
      const busyCount = await Appointment.countDocuments({
        doctorId: appt.doctorId,
        status: 'IN_PROGRESS',
        _id: { $ne: appt.id },
      });
      if (busyCount > 0) {
        throw new ConflictError('Doctor already has a patient in progress', 'DOCTOR_BUSY');
      }
    }

    const now = new Date();
    appt.status = targetStatus as any;

    if (action === 'arrive') appt.arrivedAt = now;
    if (action === 'start') appt.startedAt = now;
    if (action === 'complete') appt.completedAt = now;
    if (action === 'cancel') appt.cancelledAt = now;

    if (action === 'postpone') {
      const maxOrder = await Appointment.findOne({
        doctorId: appt.doctorId,
        clinicDate: appt.clinicDate,
        status: 'WAITING',
      }).sort({ queueOrder: -1 });
      appt.queueOrder = ((maxOrder?.queueOrder ?? appt.queueOrder) || 0) + 1;
      appt.postponedCount = (appt.postponedCount || 0) + 1;
    }

    await appt.save();

    if (action === 'start') {
      const existingVisit = await Visit.findOne({ appointmentId: appt.id });
      if (!existingVisit) {
        await Visit.create({
          appointmentId: appt.id,
          patientId: appt.patientId,
          doctorId: appt.doctorId,
        });
      }
      await DoctorStatus.findByIdAndUpdate(
        appt.doctorId,
        { _id: appt.doctorId, status: 'WITH_PATIENT' },
        { upsert: true, returnDocument: 'after' },
      );
    }

    if (action === 'complete') {
      await Visit.updateMany(
        { appointmentId: appt.id, status: 'OPEN' },
        { status: 'CLOSED', closedAt: now },
      );
      await DoctorStatus.findByIdAndUpdate(
        appt.doctorId,
        { _id: appt.doctorId, status: 'AVAILABLE' },
        { upsert: true, returnDocument: 'after' },
      );
    }

    await logAudit({
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Appointment',
      entityId: appt.id,
      before: { status: currentStatus },
      after: { status: targetStatus },
      ip,
    });

    return appt.toJSON();
  }
}

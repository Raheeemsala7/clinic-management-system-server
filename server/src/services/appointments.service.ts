import { Appointment, Patient, User, Visit, DoctorStatus } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { getTodayClinicDate } from '../utils/clinic-date';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ConflictError, BadRequestError, ValidationError } from '../utils/errors';
import { logAudit } from '../utils/audit';
import { DoctorScheduleService } from './doctor-schedule.service';

const TRANSITIONS: Record<string, string[]> = {
  BOOKED: ['WAITING', 'IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  WAITING: ['IN_PROGRESS', 'CANCELLED', 'WAITING'],
  IN_PROGRESS: ['PENDING_CHECKOUT', 'COMPLETED'],
  PENDING_CHECKOUT: ['COMPLETED', 'IN_PROGRESS', 'WAITING'],
  COMPLETED: ['PENDING_CHECKOUT'],
  CANCELLED: [],
  NO_SHOW: [],
};

const TYPE_MAP: Record<string, string> = {
  examination: 'EXAMINATION',
  revisit: 'FOLLOW_UP',
  surgery_followup: 'POST_OPERATIVE',
  lab_radiology: 'LAB_TESTS_IMAGING',
  tests_review: 'TEST_RESULTS_REVIEW',
  consultation: 'CONSULTATION',
  follow_up: 'FOLLOW_UP',
  post_operative: 'POST_OPERATIVE',
  lab_tests_imaging: 'LAB_TESTS_IMAGING',
  test_results_review: 'TEST_RESULTS_REVIEW',
};

function parseTimeString(timeStr?: string): string | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim();
  // Standard 24h: "16:30" or "09:00"
  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed)) {
    return trimmed;
  }
  // 12h formats: "04:30 م", "4:30 م", "10:15 ص", "04:30 PM", "10:15 AM"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(ص|م|am|pm)?$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const period = match[3]?.toLowerCase();
    if ((period === 'م' || period === 'pm') && hour < 12) {
      hour += 12;
    } else if ((period === 'ص' || period === 'am') && hour === 12) {
      hour = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  return trimmed;
}

export class AppointmentsService {
  static async createAppointment(dto: any, actor: { id: string }, ip = '') {
    const patientId = dto.patientId;
    let doctorId = dto.doctorId;
    if (!doctorId) {
      const defaultDoctor = await User.findOne({ role: 'DOCTOR', deletedAt: null, isActive: true });
      if (defaultDoctor) {
        doctorId = defaultDoctor.id;
      }
    }

    let source = dto.source;
    if (!source && dto.attendanceType) {
      source = dto.attendanceType === 'direct' ? 'WALK_IN' : 'SCHEDULED';
    }
    if (!source) {
      source = (dto.startTime || dto.appointmentTime || dto.scheduledAt) ? 'SCHEDULED' : 'WALK_IN';
    }

    const rawType = String(dto.type || '').trim().toLowerCase();
    const type = TYPE_MAP[rawType] || (dto.type ? String(dto.type).toUpperCase() : 'EXAMINATION');

    const startTime = parseTimeString(dto.startTime || dto.appointmentTime) || dto.startTime;
    const { scheduledAt, endTime, notes } = dto;
    const today = getTodayClinicDate();
    const clinicDate = dto.clinicDate || today;

    if (clinicDate < today) {
      throw new ValidationError('Validation failed', [
        { path: 'clinicDate', message: 'لا يمكن حجز موعد في تاريخ ماضٍ' },
      ]);
    }

    if (!patientId || !doctorId || !source || !type) {
      const errors = [];
      if (!patientId) errors.push({ path: 'patientId', message: 'patientId is required' });
      if (!doctorId) errors.push({ path: 'doctorId', message: 'doctorId is required' });
      if (!source) errors.push({ path: 'source', message: 'source is required' });
      if (!type) errors.push({ path: 'type', message: 'type is required' });
      throw new ValidationError('Validation failed', errors);
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

    // Financial calculations: If exempt, fee is 0, paid is 0, status is EXEMPT
    const isExempt = Boolean(dto.isExempt);
    const exemptionReason = isExempt ? (dto.exemptionReason || 'إعفاء بقرار الطبيب/الإدارة') : null;
    let totalAmount = isExempt ? 0 : Math.max(0, Number(dto.totalAmount ?? dto.fee ?? dto.examinationFee ?? 0));
    let paidAmount = isExempt ? 0 : Math.max(0, Number(dto.paidAmount ?? 0));
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

    // Normalize attachments: accepts link strings (urls) or structured objects
    const rawAttachments = Array.isArray(dto.attachments) ? dto.attachments : [];
    const normalizedAttachments = rawAttachments
      .map((item: any) => {
        if (typeof item === 'string') {
          const url = item.trim();
          const urlParts = url.split('/');
          const rawName = urlParts[urlParts.length - 1]?.split('?')[0] || 'attachment.jpg';
          return {
            id: uuidv4(),
            fileName: rawName,
            fileSize: 0,
            mimeType: rawName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
            url,
            uploadedAt: new Date(),
          };
        }
        return {
          id: item.id || uuidv4(),
          fileName: item.fileName || item.name || 'attachment.jpg',
          fileSize: item.fileSize || item.size || 0,
          mimeType: item.mimeType || item.type || 'image/jpeg',
          url: item.url || item.fileUrl,
          uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
        };
      })
      .filter((att: any) => Boolean(att.url));

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
      attachments: normalizedAttachments,
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
        kind: type === 'CONSULTATION' ? 'EXAMINATION' : type,
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

        const remaining = Boolean(appt.isExempt) ? 0 : Math.max(0, appt.remainingAmount || 0);
        const isPaid = Boolean(appt.isExempt) || appt.paymentStatus === 'PAID' || (appt.totalAmount > 0 && remaining === 0);
        const hasRem = !appt.isExempt && remaining > 0;

        return {
          ...appt.toJSON(),
          isFullyPaid: isPaid,
          hasRemaining: hasRem,
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
    const existingPayment = await Payment.findOne({ appointmentId: appt.id, status: 'RECORDED' });
    let payment;
    if (existingPayment) {
      existingPayment.amount = payAmount;
      existingPayment.paymentType = 'REMAINING';
      existingPayment.method = dto.method || existingPayment.method || 'CASH';
      existingPayment.notes =
        dto.notes ||
        (appt.remainingAmount === 0
          ? 'سداد كامل للمبلغ المتبقي'
          : `سداد دفعة متبقية - باقي ${appt.remainingAmount} ج.م`);
      existingPayment.receivedById = actor.id;
      await existingPayment.save();
      await Payment.deleteMany({ appointmentId: appt.id, _id: { $ne: existingPayment._id } });
      payment = existingPayment;
    } else {
      payment = await Payment.create({
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
    }

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
    action: 'arrive' | 'start' | 'finish-exam' | 'checkout' | 'complete' | 'cancel' | 'no-show' | 'postpone',
    actor: { id: string; role?: string },
    ip = '',
  ) {
    const appt = await Appointment.findById(id);
    if (!appt) throw new NotFoundError('Appointment not found');

    // إذا كان الإجراء complete:
    // إذا كان الفاعل DOCTOR، أو الموعد كان IN_PROGRESS، أو المريض عليه متبقي لم يُسدد:
    // فإن إنهاء الكشف الطبي ينقل الموعد إلى PENDING_CHECKOUT (خرج من الكشف وبانتظار المحاسبة والاستقبال)
    // حتى يظل المريض في قائمة الانتظار أمام الاستقبال حتى يتم إنهاء الزيارة أو تحصيل المتبقي!
    let targetStatus: string;
    if (action === 'complete') {
      if (actor.role === 'DOCTOR' || appt.status === 'IN_PROGRESS' || (!appt.isExempt && appt.remainingAmount > 0)) {
        targetStatus = 'PENDING_CHECKOUT';
      } else {
        targetStatus = 'COMPLETED';
      }
    } else {
      const actionMap: Record<string, string> = {
        arrive: 'WAITING',
        start: 'IN_PROGRESS',
        'finish-exam': 'PENDING_CHECKOUT',
        checkout: 'COMPLETED',
        cancel: 'CANCELLED',
        'no-show': 'NO_SHOW',
        postpone: 'WAITING',
      };
      targetStatus = actionMap[action];
    }
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
    if (action === 'complete' || action === 'checkout') appt.completedAt = now;
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

    if (action === 'finish-exam' || action === 'complete' || action === 'checkout') {
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

  static async checkout(
    id: string,
    dto: { method?: 'CASH' | 'CARD' | 'WALLET'; amount?: number; notes?: string } = {},
    actor: { id: string },
    ip = '',
  ) {
    const appt = await Appointment.findById(id);
    if (!appt) throw new NotFoundError('Appointment not found');

    if (appt.status === 'COMPLETED') {
      return appt.toJSON();
    }

    const now = new Date();

    // إذا كان المريض غير معفى وعليه متبقي، نسجل دفعة السداد
    if (!appt.isExempt && appt.remainingAmount > 0) {
      const payAmount = Number(dto.amount !== undefined ? dto.amount : appt.remainingAmount);
      if (payAmount > 0) {
        appt.paidAmount += payAmount;
        appt.remainingAmount = Math.max(0, appt.totalAmount - appt.paidAmount);
        appt.paymentStatus = appt.remainingAmount === 0 ? 'PAID' : 'PARTIAL';

        const { Payment } = await import('../models');
        // إذا كان هناك دفعة سابقة (عربون)، نقوم بتحديثها لتصبح دفعة واحدة بالمبلغ المتبقي فقط لعدم التكرار
        const existingPayment = await Payment.findOne({ appointmentId: appt.id, status: 'RECORDED' });
        if (existingPayment) {
          existingPayment.amount = payAmount;
          existingPayment.paymentType = 'REMAINING';
          existingPayment.method = dto.method || existingPayment.method || 'CASH';
          existingPayment.notes = dto.notes || 'سداد باقي قيمة الكشف عند الخروج';
          existingPayment.receivedById = actor.id;
          await existingPayment.save();
          await Payment.deleteMany({ appointmentId: appt.id, _id: { $ne: existingPayment._id } });
        } else {
          await Payment.create({
            appointmentId: appt.id,
            patientId: appt.patientId,
            amount: payAmount,
            method: dto.method || 'CASH',
            kind: appt.type === 'CONSULTATION' ? 'EXAMINATION' : appt.type,
            paymentType: 'REMAINING',
            notes: dto.notes || 'سداد باقي قيمة الكشف عند الخروج',
            receivedById: actor.id,
            status: 'RECORDED',
          });
        }
      }
    }

    appt.status = 'COMPLETED';
    appt.completedAt = now;
    await appt.save();

    await Visit.updateMany(
      { appointmentId: appt.id, status: 'OPEN' },
      { status: 'CLOSED', closedAt: now },
    );

    await DoctorStatus.findByIdAndUpdate(
      appt.doctorId,
      { _id: appt.doctorId, status: 'AVAILABLE' },
      { upsert: true, returnDocument: 'after' },
    );

    await logAudit({
      userId: actor.id,
      action: 'CHECKOUT',
      entityType: 'Appointment',
      entityId: appt.id,
      after: {
        status: 'COMPLETED',
        remainingAmount: appt.remainingAmount,
        paidAmount: appt.paidAmount,
      },
      ip,
    });

    return appt.toJSON();
  }

  static async updateAppointment(id: string, dto: any, actor: { id: string }, ip = '') {
    const appt = await Appointment.findById(id);
    if (!appt) throw new NotFoundError('Appointment not found');

    const before = appt.toJSON();

    if (dto.type !== undefined) appt.type = dto.type;
    if (dto.clinicDate !== undefined) appt.clinicDate = dto.clinicDate;
    if (dto.startTime !== undefined) appt.startTime = dto.startTime;
    if (dto.endTime !== undefined) appt.endTime = dto.endTime;
    if (dto.notes !== undefined) appt.notes = dto.notes;
    if (dto.attachments !== undefined) {
      appt.attachments = Array.isArray(dto.attachments) ? dto.attachments : [];
    }

    if (dto.isExempt !== undefined) {
      appt.isExempt = Boolean(dto.isExempt);
      if (appt.isExempt) {
        appt.exemptionReason = dto.exemptionReason || appt.exemptionReason;
        appt.totalAmount = 0;
        appt.paidAmount = 0;
        appt.remainingAmount = 0;
        appt.paymentStatus = 'EXEMPT';
      }
    }

    if (!appt.isExempt && dto.totalAmount !== undefined) {
      appt.totalAmount = Math.max(0, Number(dto.totalAmount));
      if (dto.paidAmount !== undefined) {
        appt.paidAmount = Math.min(appt.totalAmount, Math.max(0, Number(dto.paidAmount)));
      }
      appt.remainingAmount = Math.max(0, appt.totalAmount - appt.paidAmount);
      appt.paymentStatus =
        appt.remainingAmount === 0 && appt.totalAmount > 0
          ? 'PAID'
          : appt.paidAmount > 0
            ? 'PARTIAL'
            : 'UNPAID';
    }

    await appt.save();

    await logAudit({
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Appointment',
      entityId: appt.id,
      before,
      after: appt.toJSON(),
      ip,
    });

    return appt.toJSON();
  }
}


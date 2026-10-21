import { Patient, Visit, Prescription, Appointment, User } from '../models';
import { normalizeArabic, validateFourPartName } from '../utils/arabic';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';

const MEDICAL_FIELDS = ['allergies', 'chronicConditions', 'generalNotes'] as const;

function filterForReception(patient: any) {
  const json = patient.toJSON ? patient.toJSON() : { ...patient };
  delete json.allergies;
  delete json.chronicConditions;
  delete json.generalNotes;
  delete json.searchName;
  return json;
}

export class PatientsService {
  static async createPatient(dto: any, actor: { id: string; role: string }, ip = '') {
    const { fullName, phone, gender, dateOfBirth, age, address, allergies, chronicConditions, generalNotes } = dto;

    if (!fullName || !phone || !gender) {
      throw new BadRequestError('fullName, phone, and gender are required');
    }

    const nameValidation = validateFourPartName(fullName);
    if (!nameValidation.isValid) {
      throw new BadRequestError('يجب إدخال اسم المريض رباعياً على الأقل (أربعة مقاطع)');
    }

    if (actor.role === 'RECEPTION') {
      for (const field of MEDICAL_FIELDS) {
        if (dto[field] !== undefined) {
          throw new ForbiddenError(`Reception cannot set medical field: ${field}`);
        }
      }
    }

    let parsedAge: number | undefined = undefined;
    if (age !== undefined && age !== null && age !== '') {
      parsedAge = Number(age);
    } else if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      let a = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
      parsedAge = a >= 0 ? a : undefined;
    }

    const patient = await Patient.create({
      fullName,
      searchName: normalizeArabic(fullName),
      phone,
      gender,
      age: parsedAge,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : (parsedAge !== undefined ? new Date(new Date().getFullYear() - parsedAge, 0, 1) : null),
      address: address || null,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      generalNotes: generalNotes || null,
      createdById: actor.id,
    });

    await logAudit({
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Patient',
      entityId: patient.id,
      after: { fullName: patient.fullName, phone: patient.phone },
      ip,
    });

    return actor.role === 'RECEPTION' ? filterForReception(patient) : patient.toJSON();
  }

  static async searchPatients(q = '', actorRole = '', pageQuery?: string, pageSizeQuery?: string) {
    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    const filter: any = { deletedAt: null };

    if (q.trim()) {
      const normalized = normalizeArabic(q);
      const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const safeNormalized = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.$or = [
        { searchName: { $regex: safeNormalized, $options: 'i' } },
        { phone: { $regex: safeQuery, $options: 'i' } },
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Patient.countDocuments(filter),
    ]);

    const formatted = patients.map((p) =>
      actorRole === 'RECEPTION' ? filterForReception(p) : p.toJSON(),
    );

    return buildPaginatedResult(formatted, total, page, pageSize);
  }

  static async getPatientById(id: string, actorRole = '') {
    const patient = await Patient.findOne({ _id: id, deletedAt: null });
    if (!patient) throw new NotFoundError('Patient not found');
    return actorRole === 'RECEPTION' ? filterForReception(patient) : patient.toJSON();
  }

  static async updatePatient(id: string, dto: any, actor: { id: string; role: string }, ip = '') {
    const patient = await Patient.findOne({ _id: id, deletedAt: null });
    if (!patient) throw new NotFoundError('Patient not found');

    if (actor.role === 'RECEPTION') {
      for (const field of MEDICAL_FIELDS) {
        if (dto[field] !== undefined) {
          throw new ForbiddenError(`Reception cannot update medical field: ${field}`);
        }
      }
    }

    const before = patient.toJSON();

    if (dto.fullName !== undefined) {
      const nameValidation = validateFourPartName(dto.fullName);
      if (!nameValidation.isValid) {
        throw new BadRequestError('يجب إدخال اسم المريض رباعياً على الأقل (أربعة مقاطع)');
      }
      patient.fullName = nameValidation.normalized;
      patient.searchName = normalizeArabic(nameValidation.normalized);
    }
    if (dto.phone !== undefined) patient.phone = dto.phone;
    if (dto.gender !== undefined) patient.gender = dto.gender;
    if (dto.age !== undefined) {
      patient.age = dto.age !== null && dto.age !== '' ? Number(dto.age) : undefined;
    }
    if (dto.dateOfBirth !== undefined) {
      patient.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    if (dto.address !== undefined) patient.address = dto.address;
    if (actor.role !== 'RECEPTION') {
      if (dto.allergies !== undefined) patient.allergies = dto.allergies;
      if (dto.chronicConditions !== undefined) patient.chronicConditions = dto.chronicConditions;
      if (dto.generalNotes !== undefined) patient.generalNotes = dto.generalNotes;
    }

    await patient.save();

    await logAudit({
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Patient',
      entityId: patient.id,
      before,
      after: patient.toJSON(),
      ip,
    });

    return actor.role === 'RECEPTION' ? filterForReception(patient) : patient.toJSON();
  }

  static async getPatientHistory(patientId: string, pageQuery?: string, pageSizeQuery?: string) {
    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    const patient = await Patient.findOne({ _id: patientId, deletedAt: null });
    if (!patient) throw new NotFoundError('Patient not found');

    const [visits, total] = await Promise.all([
      Visit.find({ patientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Visit.countDocuments({ patientId }),
    ]);

    const visitItems = await Promise.all(
      visits.map(async (v) => {
        const [prescriptions, appointment] = await Promise.all([
          Prescription.find({ visitId: v.id }).sort({ versionNumber: -1 }),
          Appointment.findById(v.appointmentId).select('clinicDate type'),
        ]);

        return {
          id: v.id,
          appointmentId: v.appointmentId,
          patientId: v.patientId,
          complaint: v.complaint || null,
          diagnosis: v.diagnosis || null,
          notes: v.notes || null,
          instructions: v.instructions || null,
          followUpDate: v.followUpDate ? v.followUpDate.toISOString() : null,
          status: v.status,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
          prescriptions: prescriptions.map((p) => p.toJSON()),
          attachments: [],
          appointment: appointment
            ? { clinicDate: appointment.clinicDate, type: appointment.type }
            : undefined,
        };
      }),
    );

    return buildPaginatedResult(visitItems, total, page, pageSize);
  }

  static async getPatientSummary(patientId: string) {
    const patient = await Patient.findOne({ _id: patientId, deletedAt: null });
    if (!patient) throw new NotFoundError('Patient not found');

    const [visitCount, lastVisit, lastPrescription] = await Promise.all([
      Visit.countDocuments({ patientId }),
      Visit.findOne({ patientId }).sort({ createdAt: -1 }),
      Prescription.findOne({ patientId }).sort({ createdAt: -1 }),
    ]);

    let age: number | null = (patient as any).age ?? null;
    if (age === null && patient.dateOfBirth) {
      const now = new Date();
      const dob = new Date(patient.dateOfBirth);
      age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    }

    return {
      id: patient.id,
      fullName: patient.fullName,
      age,
      gender: patient.gender,
      allergies: patient.allergies || [],
      chronicConditions: patient.chronicConditions || [],
      visitCount,
      lastVisitDate: lastVisit?.createdAt ? lastVisit.createdAt.toISOString() : null,
      lastDiagnosis: lastVisit?.diagnosis || null,
      lastPrescriptionItems: (lastPrescription?.items || []).map((item: any) => ({
        drugName: item.drugName,
        dose: item.dose,
        frequency: item.frequency,
        duration: item.duration,
      })),
    };
  }

  static async getPatientBookingSummary(patientId: string) {
    const patient = await Patient.findOne({ _id: patientId, deletedAt: null });
    if (!patient) throw new NotFoundError('Patient not found');

    let age: number | null = (patient as any).age ?? null;
    if (age === null && patient.dateOfBirth) {
      const now = new Date();
      const dob = new Date(patient.dateOfBirth);
      age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    }

    // 1. Fetch recent appointments
    const appointments = await Appointment.find({ patientId, status: { $ne: 'CANCELLED' } })
      .sort({ clinicDate: -1, createdAt: -1 })
      .limit(10);

    const populatedAppointments = await Promise.all(
      appointments.map(async (appt) => {
        const doc = await User.findById(appt.doctorId).select('name');
        return {
          id: appt.id,
          clinicDate: appt.clinicDate,
          type: appt.type === 'CONSULTATION' ? 'EXAMINATION' : appt.type,
          status: appt.status,
          startTime: appt.startTime || null,
          totalAmount: appt.totalAmount || 0,
          paidAmount: appt.paidAmount || 0,
          remainingAmount: appt.remainingAmount || 0,
          paymentStatus: appt.paymentStatus,
          doctorName: doc ? doc.name : null,
          createdAt: appt.createdAt ? appt.createdAt.toISOString() : null,
        };
      }),
    );

    // 2. Fetch last visit / examination
    const lastVisit = await Visit.findOne({ patientId }).sort({ createdAt: -1 });
    let lastVisitDetails: any = null;
    if (lastVisit) {
      const [lastAppt, doc] = await Promise.all([
        Appointment.findById(lastVisit.appointmentId),
        User.findById(lastVisit.doctorId).select('name'),
      ]);
      lastVisitDetails = {
        date: lastVisit.createdAt.toISOString(),
        appointmentType:
          lastAppt?.type === 'CONSULTATION' ? 'EXAMINATION' : lastAppt?.type || 'EXAMINATION',
        doctorName: doc?.name || null,
        diagnosis: lastVisit.diagnosis || null,
        notes: lastVisit.notes || null,
        status: lastVisit.status,
      };
    } else if (populatedAppointments.length > 0) {
      const mostRecent = populatedAppointments[0];
      lastVisitDetails = {
        date: mostRecent.createdAt,
        appointmentType: mostRecent.type,
        doctorName: mostRecent.doctorName,
        diagnosis: null,
        notes: null,
        status: mostRecent.status,
      };
    }

    // 3. Financial calculations across all active patient appointments
    const allAppts = await Appointment.find({ patientId, status: { $ne: 'CANCELLED' } });
    let totalCharged = 0;
    let totalPaid = 0;
    let outstandingBalance = 0;
    for (const appt of allAppts) {
      totalCharged += appt.totalAmount || 0;
      totalPaid += appt.paidAmount || 0;
      outstandingBalance += appt.remainingAmount || 0;
    }

    let overallPaymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PAID';
    if (outstandingBalance > 0 && totalPaid > 0) {
      overallPaymentStatus = 'PARTIAL';
    } else if (outstandingBalance > 0 && totalPaid === 0) {
      overallPaymentStatus = 'UNPAID';
    }

    const { Payment } = await import('../models');
    const recentPayments = await Payment.find({ patientId, status: 'RECORDED' })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        gender: patient.gender,
        age,
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString() : null,
        address: patient.address || null,
      },
      lastVisit: lastVisitDetails,
      financialSummary: {
        totalCharged,
        totalPaid,
        outstandingBalance,
        paymentStatus: overallPaymentStatus,
        recentPayments: recentPayments.map((p) => p.toJSON()),
      },
      previousAppointments: populatedAppointments,
    };
  }
}

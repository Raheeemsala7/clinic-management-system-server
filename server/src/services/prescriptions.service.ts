import { Prescription, PrescriptionTemplate, Patient, User, Setting } from '../models';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class PrescriptionsService {
  static async getPrintReady(id: string, actorId: string) {
    const prescription = await Prescription.findById(id);
    if (!prescription) throw new NotFoundError('Prescription not found');

    const [patient, doctor, settingsDocs] = await Promise.all([
      Patient.findById(prescription.patientId).select('fullName dateOfBirth gender'),
      User.findById(prescription.doctorId).select('name'),
      Setting.find(),
    ]);

    const settings: Record<string, string> = {
      clinicName: 'City Clinic',
      doctorDisplayName: 'Dr. Name',
      specialty: 'General Practice',
      address: '',
      phone: '',
    };
    for (const doc of settingsDocs) {
      settings[doc._id] = doc.value;
    }

    let age: number | null = null;
    if (patient?.dateOfBirth) {
      const now = new Date();
      const dob = new Date(patient.dateOfBirth);
      age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    }

    await logAudit({
      userId: actorId,
      action: 'READ',
      entityType: 'Prescription',
      entityId: id,
    });

    return {
      ...prescription.toJSON(),
      patient: patient ? patient.toJSON() : null,
      doctor: doctor ? doctor.toJSON() : null,
      printMeta: {
        clinicName: settings.clinicName,
        doctorDisplayName: settings.doctorDisplayName,
        specialty: settings.specialty,
        address: settings.address,
        phone: settings.phone,
        patientAge: age,
        date: prescription.createdAt.toISOString().split('T')[0],
      },
    };
  }

  static async markPrinted(id: string, actorId: string) {
    const prescription = await Prescription.findById(id);
    if (!prescription) throw new NotFoundError('Prescription not found');

    if (!prescription.printedAt) {
      prescription.printedAt = new Date();
      await prescription.save();
    }

    await logAudit({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Prescription',
      entityId: id,
      after: { printed: true },
    });

    return prescription.toJSON();
  }

  static async getByPatient(patientId: string, pageQuery?: string, pageSizeQuery?: string) {
    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    const [prescriptions, total] = await Promise.all([
      Prescription.find({ patientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Prescription.countDocuments({ patientId }),
    ]);

    return buildPaginatedResult(prescriptions.map((p) => p.toJSON()), total, page, pageSize);
  }

  static async getTemplates(doctorId: string) {
    const templates = await PrescriptionTemplate.find({ doctorId }).sort({ name: 1 });
    return templates.map((t) => t.toJSON());
  }

  static async createTemplate(doctorId: string, dto: { name: string; notes?: string; items?: any[] }) {
    if (!dto.name) throw new BadRequestError('Template name is required');

    const template = await PrescriptionTemplate.create({
      doctorId,
      name: dto.name,
      notes: dto.notes || null,
      items: dto.items || [],
    });

    return template.toJSON();
  }

  static async deleteTemplate(id: string, doctorId: string) {
    const template = await PrescriptionTemplate.findOne({ _id: id, doctorId });
    if (!template) throw new NotFoundError('Template not found');

    await PrescriptionTemplate.deleteOne({ _id: id });
  }
}

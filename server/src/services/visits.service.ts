import { Visit, Patient, Prescription, Drug } from '../models';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class VisitsService {
  static async getVisitById(id: string, actorId: string) {
    const visit = await Visit.findById(id);
    if (!visit) throw new NotFoundError('Visit not found');

    const [patient, prescriptions] = await Promise.all([
      Patient.findById(visit.patientId).select(
        'id fullName phone gender dateOfBirth allergies chronicConditions generalNotes',
      ),
      Prescription.find({ visitId: visit.id }).sort({ versionNumber: -1 }),
    ]);

    await logAudit({
      userId: actorId,
      action: 'READ',
      entityType: 'Visit',
      entityId: id,
    });

    return {
      ...visit.toJSON(),
      patient: patient ? patient.toJSON() : null,
      prescriptions: prescriptions.map((p) => p.toJSON()),
      attachments: [],
    };
  }

  static async autosaveVisit(id: string, dto: any, actorId: string, ip = '') {
    const { version, complaint, diagnosis, notes, instructions, followUpDate } = dto;

    const visit = await Visit.findById(id);
    if (!visit) throw new NotFoundError('Visit not found');

    if (visit.status === 'CLOSED') {
      throw new ConflictError('Visit is closed. Reopen before editing.', 'VISIT_CLOSED');
    }

    if (Number(version) !== visit.version) {
      throw new ConflictError(
        `Visit was updated by another session. Current version: ${visit.version}, your version: ${version}`,
        'VERSION_CONFLICT',
      );
    }

    const before = visit.toJSON();

    if (complaint !== undefined) visit.complaint = complaint;
    if (diagnosis !== undefined) visit.diagnosis = diagnosis;
    if (notes !== undefined) visit.notes = notes;
    if (instructions !== undefined) visit.instructions = instructions;
    if (followUpDate !== undefined) {
      visit.followUpDate = followUpDate ? new Date(followUpDate) : undefined;
    }
    visit.version = visit.version + 1;

    await visit.save();

    await logAudit({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Visit',
      entityId: id,
      before,
      after: visit.toJSON(),
      ip,
    });

    return {
      ...visit.toJSON(),
      version: visit.version,
    };
  }

  static async closeVisit(id: string, actorId: string, ip = '') {
    const visit = await Visit.findById(id);
    if (!visit) throw new NotFoundError('Visit not found');

    if (visit.status === 'CLOSED') {
      return visit.toJSON();
    }

    visit.status = 'CLOSED';
    visit.closedAt = new Date();
    await visit.save();

    await logAudit({
      userId: actorId,
      action: 'CLOSE',
      entityType: 'Visit',
      entityId: id,
      ip,
    });

    return visit.toJSON();
  }

  static async reopenVisit(id: string, actorId: string, ip = '') {
    const visit = await Visit.findById(id);
    if (!visit) throw new NotFoundError('Visit not found');

    if (visit.status === 'OPEN') {
      return visit.toJSON();
    }

    visit.status = 'OPEN';
    visit.closedAt = undefined;
    await visit.save();

    await logAudit({
      userId: actorId,
      action: 'REOPEN',
      entityType: 'Visit',
      entityId: id,
      ip,
    });

    return visit.toJSON();
  }

  static async addPrescription(visitId: string, dto: any, actorId: string, ip = '') {
    const { items, notes } = dto;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Prescription items are required');
    }

    const visit = await Visit.findById(visitId);
    if (!visit) throw new NotFoundError('Visit not found');

    const latest = await Prescription.findOne({ visitId }).sort({ versionNumber: -1 });
    const versionNumber = (latest?.versionNumber || 0) + 1;

    const formattedItems = items.map((item: any, idx: number) => ({
      drugName: item.drugName,
      dose: item.dose,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions || null,
      sortOrder: item.sortOrder ?? idx,
    }));

    const prescription = await Prescription.create({
      visitId,
      patientId: visit.patientId,
      doctorId: visit.doctorId,
      versionNumber,
      supersedesId: latest?.id || null,
      notes: notes || null,
      items: formattedItems,
    });

    await Promise.all(
      formattedItems.map((item: any) =>
        Drug.findOneAndUpdate(
          { name: item.drugName.toLowerCase().trim() },
          { $inc: { usageCount: 1 }, $setOnInsert: { isActive: true } },
          { upsert: true },
        ),
      ),
    );

    await logAudit({
      userId: actorId,
      action: 'CREATE',
      entityType: 'Prescription',
      entityId: prescription.id,
      after: { versionNumber, itemsCount: formattedItems.length },
      ip,
    });

    return prescription.toJSON();
  }
}

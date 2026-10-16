import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { SettingsService } from 'src/settings/settings.service';
import { parsePagination, buildPaginatedResult } from 'src/common/utils/pagination.util';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private settingsService: SettingsService,
  ) {}

  async createForVisit(
    visitId: string,
    dto: CreatePrescriptionDto,
    actor: JwtPayload,
    ip?: string,
  ) {
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new NotFoundException('Visit not found');

    // Find the latest version for this visit
    const latest = await this.prisma.prescription.findFirst({
      where: { visitId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (latest?.versionNumber ?? 0) + 1;

    const prescription = await this.prisma.prescription.create({
      data: {
        visitId,
        patientId: visit.patientId,
        doctorId: visit.doctorId,
        versionNumber,
        supersedesId: latest?.id ?? null,
        notes: dto.notes ?? null,
        items: {
          create: dto.items.map((item, idx) => ({
            drugName: item.drugName,
            dose: item.dose,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions ?? null,
            sortOrder: item.sortOrder ?? idx,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    // Upsert drug catalog for every drug name used
    await Promise.all(
      dto.items.map((item) =>
        this.prisma.drug.upsert({
          where: { name: item.drugName.toLowerCase() },
          create: { name: item.drugName.toLowerCase(), usageCount: 1 },
          update: { usageCount: { increment: 1 } },
        }),
      ),
    );

    await this.auditService.log({
      userId: actor.sub,
      action: 'CREATE',
      entityType: 'Prescription',
      entityId: prescription.id,
      after: { versionNumber } as Record<string, unknown>,
      ip,
    });

    return prescription;
  }

  async findOne(id: string, actor: JwtPayload) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        patient: { select: { fullName: true, dateOfBirth: true, gender: true } },
        doctor: { select: { name: true } },
      },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');

    const settings = await this.settingsService.getAll();

    await this.auditService.log({
      userId: actor.sub,
      action: 'READ',
      entityType: 'Prescription',
      entityId: id,
    });

    // Compute patient age from dateOfBirth
    let age: number | null = null;
    if (prescription.patient.dateOfBirth) {
      const now = new Date();
      const dob = new Date(prescription.patient.dateOfBirth);
      age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    }

    return {
      ...prescription,
      printMeta: {
        clinicName: settings['clinicName'],
        doctorDisplayName: settings['doctorDisplayName'],
        specialty: settings['specialty'],
        address: settings['address'],
        phone: settings['phone'],
        patientAge: age,
        date: prescription.createdAt.toISOString().split('T')[0],
      },
    };
  }

  async markPrinted(id: string, actor: JwtPayload) {
    const prescription = await this.prisma.prescription.findUnique({ where: { id } });
    if (!prescription) throw new NotFoundException('Prescription not found');

    // Only record the first print time
    const updated = await this.prisma.prescription.update({
      where: { id },
      data: { printedAt: prescription.printedAt ?? new Date() },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'UPDATE',
      entityType: 'Prescription',
      entityId: id,
      after: { printed: true } as Record<string, unknown>,
    });

    return updated;
  }

  async findByPatient(patientId: string, page: number, pageSize: number) {
    const { skip, take } = parsePagination({ page, pageSize });
    const [data, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      }),
      this.prisma.prescription.count({ where: { patientId } }),
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  // ── Templates ─────────────────────────────────────────────────────────────

  async getTemplates(doctorId: string) {
    return this.prisma.prescriptionTemplate.findMany({
      where: { doctorId },
      orderBy: { name: 'asc' },
    });
  }

  async createTemplate(dto: CreateTemplateDto, actor: JwtPayload) {
    return this.prisma.prescriptionTemplate.create({
      data: {
        doctorId: actor.sub,
        name: dto.name,
        notes: dto.notes ?? null,
        // Cast to Prisma's InputJsonValue — dto.items is a plain array
        items: dto.items as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async deleteTemplate(id: string, actor: JwtPayload) {
    const template = await this.prisma.prescriptionTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    // Doctors can only delete their own templates
    if (template.doctorId !== actor.sub) {
      throw new NotFoundException('Template not found');
    }
    return this.prisma.prescriptionTemplate.delete({ where: { id } });
  }
}

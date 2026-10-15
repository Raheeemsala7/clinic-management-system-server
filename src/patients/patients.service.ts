import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { normalizeArabic } from 'src/common/utils/arabic-normalize.util';
import { parsePagination, buildPaginatedResult } from 'src/common/utils/pagination.util';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

// Fields visible to RECEPTION only (no medical data)
const BASIC_SELECT = {
  id: true,
  fullName: true,
  phone: true,
  gender: true,
  dateOfBirth: true,
  address: true,
  createdAt: true,
  updatedAt: true,
};

const FULL_SELECT = {
  ...BASIC_SELECT,
  allergies: true,
  chronicConditions: true,
  generalNotes: true,
};

const MEDICAL_FIELDS = ['allergies', 'chronicConditions', 'generalNotes'] as const;

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreatePatientDto, actor: JwtPayload, ip?: string) {
    if (actor.role === Role.RECEPTION) {
      for (const field of MEDICAL_FIELDS) {
        if (dto[field] !== undefined) {
          throw new ForbiddenException({
            error: {
              code: 'MEDICAL_FIELD_FORBIDDEN',
              message: `Reception cannot set medical field: ${field}`,
            },
          });
        }
      }
    }

    const patient = await this.prisma.patient.create({
      data: {
        fullName: dto.fullName,
        searchName: normalizeArabic(dto.fullName),
        phone: dto.phone,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        address: dto.address ?? null,
        allergies: dto.allergies ?? [],
        chronicConditions: dto.chronicConditions ?? [],
        generalNotes: dto.generalNotes ?? null,
        createdById: actor.sub,
      },
      select: actor.role === Role.RECEPTION ? BASIC_SELECT : FULL_SELECT,
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'CREATE',
      entityType: 'Patient',
      entityId: patient.id,
      after: patient as Record<string, unknown>,
      ip,
    });

    return patient;
  }

  async search(q: string, actor: JwtPayload, page: number, pageSize: number) {
    const normalized = normalizeArabic(q);
    const { skip, take } = parsePagination({ page, pageSize });
    const select = actor.role === Role.RECEPTION ? BASIC_SELECT : FULL_SELECT;

    const where = q
      ? {
          deletedAt: null,
          OR: [
            { searchName: { contains: normalized } },
            { phone: { contains: q } },
          ],
        }
      : { deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({ where, select, skip, take, orderBy: { fullName: 'asc' } }),
      this.prisma.patient.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, pageSize);
  }

  async findOne(id: string, actor: JwtPayload) {
    const select = actor.role === Role.RECEPTION ? BASIC_SELECT : FULL_SELECT;
    const patient = await this.prisma.patient.findUnique({ where: { id, deletedAt: null }, select });
    if (!patient) throw new NotFoundException('Patient not found');

    // Audit read for sensitive roles
    if (actor.role !== Role.RECEPTION) {
      await this.auditService.log({
        userId: actor.sub,
        action: 'READ',
        entityType: 'Patient',
        entityId: id,
      });
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto, actor: JwtPayload, ip?: string) {
    if (actor.role === Role.RECEPTION) {
      for (const field of MEDICAL_FIELDS) {
        if (dto[field] !== undefined) {
          throw new ForbiddenException({
            error: {
              code: 'MEDICAL_FIELD_FORBIDDEN',
              message: `Reception cannot update medical field: ${field}`,
            },
          });
        }
      }
    }

    const existing = await this.prisma.patient.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Patient not found');

    const data: Record<string, unknown> = {};
    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName;
      data.searchName = normalizeArabic(dto.fullName);
    }
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) data.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    if (dto.address !== undefined) data.address = dto.address;
    if (actor.role !== Role.RECEPTION) {
      if (dto.allergies !== undefined) data.allergies = dto.allergies;
      if (dto.chronicConditions !== undefined) data.chronicConditions = dto.chronicConditions;
      if (dto.generalNotes !== undefined) data.generalNotes = dto.generalNotes;
    }

    const select = actor.role === Role.RECEPTION ? BASIC_SELECT : FULL_SELECT;
    const updated = await this.prisma.patient.update({ where: { id }, data, select });

    await this.auditService.log({
      userId: actor.sub,
      action: 'UPDATE',
      entityType: 'Patient',
      entityId: id,
      before: existing as Record<string, unknown>,
      after: updated as Record<string, unknown>,
      ip,
    });

    return updated;
  }

  async getHistory(patientId: string, actor: JwtPayload, page: number, pageSize: number) {
    if (actor.role === Role.RECEPTION) {
      throw new ForbiddenException({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId, deletedAt: null } });
    if (!patient) throw new NotFoundException('Patient not found');

    const { skip, take } = parsePagination({ page, pageSize });

    const visits = await this.prisma.visit.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        prescriptions: {
          orderBy: { versionNumber: 'desc' },
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        },
        attachments: {
          where: { deletedAt: null },
          select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
        },
        appointment: { select: { clinicDate: true, type: true } },
      },
    });

    const total = await this.prisma.visit.count({ where: { patientId } });

    await this.auditService.log({
      userId: actor.sub,
      action: 'READ',
      entityType: 'PatientHistory',
      entityId: patientId,
    });

    return buildPaginatedResult(visits, total, page, pageSize);
  }

  async getSummary(patientId: string, actor: JwtPayload) {
    if (actor.role === Role.RECEPTION) {
      throw new ForbiddenException({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId, deletedAt: null },
      select: { ...FULL_SELECT, dateOfBirth: true, allergies: true, chronicConditions: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const visitCount = await this.prisma.visit.count({ where: { patientId } });
    const lastVisit = await this.prisma.visit.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        prescriptions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    // Compute age
    let age: number | null = null;
    if (patient.dateOfBirth) {
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
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions,
      visitCount,
      lastVisitDate: lastVisit?.createdAt ?? null,
      lastDiagnosis: lastVisit?.diagnosis ?? null,
      lastPrescriptionItems: lastVisit?.prescriptions[0]?.items ?? [],
    };
  }
}

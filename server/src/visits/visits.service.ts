import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { VisitStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { BusinessException } from 'src/common/filters/business-exception';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class VisitsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findOne(id: string, actor: JwtPayload) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true, fullName: true, phone: true, gender: true,
            dateOfBirth: true, allergies: true, chronicConditions: true, generalNotes: true,
          },
        },
        prescriptions: {
          orderBy: { versionNumber: 'desc' },
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        },
        attachments: {
          where: { deletedAt: null },
          select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
        },
      },
    });
    if (!visit) throw new NotFoundException('Visit not found');

    await this.auditService.log({
      userId: actor.sub,
      action: 'READ',
      entityType: 'Visit',
      entityId: id,
    });

    return visit;
  }

  async update(id: string, dto: UpdateVisitDto, actor: JwtPayload, ip?: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException('Visit not found');

    if (visit.status === VisitStatus.CLOSED) {
      throw new BusinessException('VISIT_CLOSED', 'Visit is closed. Reopen before editing.', 409);
    }

    if (visit.version !== dto.version) {
      throw new BusinessException(
        'VERSION_CONFLICT',
        `Visit was updated by another session. Current version: ${visit.version}, your version: ${dto.version}`,
        409,
      );
    }

    const data: Record<string, unknown> = { version: visit.version + 1 };
    if (dto.complaint !== undefined) data.complaint = dto.complaint;
    if (dto.diagnosis !== undefined) data.diagnosis = dto.diagnosis;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.instructions !== undefined) data.instructions = dto.instructions;
    if (dto.followUpDate !== undefined) data.followUpDate = dto.followUpDate ? new Date(dto.followUpDate) : null;

    const updated = await this.prisma.visit.update({ where: { id }, data });

    await this.auditService.log({
      userId: actor.sub,
      action: 'UPDATE',
      entityType: 'Visit',
      entityId: id,
      before: visit as Record<string, unknown>,
      after: updated as Record<string, unknown>,
      ip,
    });

    return updated;
  }

  async close(id: string, actor: JwtPayload, ip?: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.status === VisitStatus.CLOSED) return visit;

    const updated = await this.prisma.visit.update({
      where: { id },
      data: { status: VisitStatus.CLOSED, closedAt: new Date() },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'UPDATE',
      entityType: 'Visit',
      entityId: id,
      before: { status: VisitStatus.OPEN } as Record<string, unknown>,
      after: { status: VisitStatus.CLOSED } as Record<string, unknown>,
      ip,
    });

    return updated;
  }

  async reopen(id: string, actor: JwtPayload, ip?: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException('Visit not found');

    const updated = await this.prisma.visit.update({
      where: { id },
      data: { status: VisitStatus.OPEN, closedAt: null },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'REOPEN',
      entityType: 'Visit',
      entityId: id,
      before: { status: VisitStatus.CLOSED } as Record<string, unknown>,
      after: { status: VisitStatus.OPEN } as Record<string, unknown>,
      ip,
    });

    return updated;
  }
}

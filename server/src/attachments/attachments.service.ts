import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { STORAGE_SERVICE, StorageService } from './storage/storage.interface';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

// Allowed MIME types and their magic bytes
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_VISIT = 10;

// Magic byte signatures
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (needs further check)
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

function detectMimeFromBuffer(buffer: Buffer): string | null {
  for (const [mime, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const sig of signatures) {
      if (sig.every((byte, i) => buffer[i] === byte)) {
        return mime;
      }
    }
  }
  return null;
}

@Injectable()
export class AttachmentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Inject(STORAGE_SERVICE) private storage: StorageService,
  ) {}

  async upload(
    visitId: string,
    file: Express.Multer.File,
    actor: JwtPayload,
    ip?: string,
  ) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException({ error: { code: 'FILE_TOO_LARGE', message: 'File exceeds 10 MB limit' } });
    }

    // Verify magic bytes
    const detectedMime = detectMimeFromBuffer(file.buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      throw new BadRequestException({
        error: { code: 'INVALID_FILE_TYPE', message: 'Only JPEG, PNG, WebP, and PDF files are allowed' },
      });
    }

    // Check visit exists
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new NotFoundException('Visit not found');

    // Check max files per visit
    const existingCount = await this.prisma.attachment.count({
      where: { visitId, deletedAt: null },
    });
    if (existingCount >= MAX_FILES_PER_VISIT) {
      throw new BadRequestException({
        error: { code: 'MAX_ATTACHMENTS_EXCEEDED', message: `Maximum ${MAX_FILES_PER_VISIT} attachments per visit` },
      });
    }

    // Generate storage key
    const ext = detectedMime.split('/')[1].replace('jpeg', 'jpg');
    const storageKey = `visits/${visitId}/${uuidv4()}.${ext}`;

    await this.storage.save(storageKey, file.buffer, detectedMime);

    const attachment = await this.prisma.attachment.create({
      data: {
        visitId,
        patientId: visit.patientId,
        uploadedById: actor.sub,
        fileName: file.originalname,
        mimeType: detectedMime,
        sizeBytes: file.size,
        storageKey,
      },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'CREATE',
      entityType: 'Attachment',
      entityId: attachment.id,
      after: { fileName: file.originalname, mimeType: detectedMime } as Record<string, unknown>,
      ip,
    });

    return attachment;
  }

  async stream(id: string, actor: JwtPayload) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id, deletedAt: null } });
    if (!attachment) throw new NotFoundException('Attachment not found');

    await this.auditService.log({
      userId: actor.sub,
      action: 'READ',
      entityType: 'Attachment',
      entityId: id,
    });

    const stream = await this.storage.getStream(attachment.storageKey);
    return { stream, attachment };
  }

  async softDelete(id: string, actor: JwtPayload, ip?: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id, deletedAt: null } });
    if (!attachment) throw new NotFoundException('Attachment not found');

    const updated = await this.prisma.attachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'DELETE',
      entityType: 'Attachment',
      entityId: id,
      before: { fileName: attachment.fileName } as Record<string, unknown>,
      ip,
    });

    return updated;
  }
}

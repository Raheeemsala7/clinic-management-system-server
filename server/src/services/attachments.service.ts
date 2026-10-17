import path from 'path';
import fs from 'fs';
import { Attachment } from '../models';
import { config } from '../config/env';
import { NotFoundError } from '../utils/errors';
import { logAudit } from '../utils/audit';

const uploadDir = path.resolve(process.cwd(), config.storage.localPath);

export class AttachmentsService {
  static async getFileStream(id: string) {
    const attachment = await Attachment.findOne({ _id: id, deletedAt: null });
    if (!attachment) throw new NotFoundError('Attachment not found');

    const filePath = path.join(uploadDir, attachment.storageKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('Attachment file not found on disk');
    }

    return {
      attachment,
      stream: fs.createReadStream(filePath),
    };
  }

  static async softDelete(id: string, actorId: string, ip = '') {
    const attachment = await Attachment.findOne({ _id: id, deletedAt: null });
    if (!attachment) throw new NotFoundError('Attachment not found');

    attachment.deletedAt = new Date();
    await attachment.save();

    await logAudit({
      userId: actorId,
      action: 'DELETE',
      entityType: 'Attachment',
      entityId: id,
      ip,
    });
  }
}

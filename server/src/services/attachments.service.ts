import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import FileType from 'file-type';
import { BadRequestError } from '../utils/errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 5MB
const MAX_FILES_PER_BATCH = 5;

// On serverless environments (like Vercel / AWS Lambda), the root filesystem (/var/task)
// is read-only. Only /tmp (os.tmpdir()) is writable.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const UPLOAD_DIR = isServerless
  ? path.join(os.tmpdir(), 'clinic_uploads', 'appointments')
  : path.resolve(process.cwd(), process.env.LOCAL_STORAGE_PATH || 'uploads/appointments');

function ensureUploadDir(): void {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (err) {
    // Non-fatal warning so module load never crashes on read-only environments
    console.warn('⚠️ [STORAGE] Upload directory warning:', err);
  }
}

// Attempt initialization without throwing on import
ensureUploadDir();

export interface StoredAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

export class AttachmentsService {
  /**
   * Validates and saves an uploaded file (from base64 or raw buffer).
   * Verifies real file signature (magic bytes) to prevent forged file extensions.
   */
  static async saveFile(
    fileName: string,
    dataInput: string | Buffer,
  ): Promise<StoredAttachment> {
    let buffer: Buffer;

    if (Buffer.isBuffer(dataInput)) {
      buffer = dataInput;
    } else if (typeof dataInput === 'string') {
      // Handle base64 string or data URL
      const base64Data = dataInput.includes(';base64,')
        ? dataInput.split(';base64,')[1]
        : dataInput;
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      throw new BadRequestError('Invalid file data provided');
    }

    if (buffer.length === 0) {
      throw new BadRequestError('Uploaded file is empty');
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError('File size exceeds the 5MB limit');
    }

    // Inspect real file signature (magic bytes)
    const detectedType = await FileType.fromBuffer(buffer);
    if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
      throw new BadRequestError(
        'Invalid file type. Only JPEG, PNG, and WebP images are permitted',
      );
    }

    // Ensure directory exists right before write
    ensureUploadDir();

    const safeExt = detectedType.ext;
    const fileId = uuidv4();
    const storedFileName = `${fileId}.${safeExt}`;
    const destinationPath = path.join(UPLOAD_DIR, storedFileName);

    await fs.promises.writeFile(destinationPath, buffer);

    const safeOriginalName = path.basename(fileName || `attachment.${safeExt}`);

    return {
      id: fileId,
      fileName: safeOriginalName,
      fileSize: buffer.length,
      mimeType: detectedType.mime,
      url: `/api/v1/attachments/file/${storedFileName}`,
      uploadedAt: new Date(),
    };
  }

  static async saveMultipleFiles(
    files: Array<{ name: string; data: string | Buffer }>,
  ): Promise<StoredAttachment[]> {
    if (!Array.isArray(files) || files.length === 0) {
      throw new BadRequestError('No files provided');
    }

    if (files.length > MAX_FILES_PER_BATCH) {
      throw new BadRequestError(`Maximum ${MAX_FILES_PER_BATCH} files allowed per upload`);
    }

    const results: StoredAttachment[] = [];
    for (const file of files) {
      const stored = await this.saveFile(file.name, file.data);
      results.push(stored);
    }

    return results;
  }

  static getFilePath(filename: string): { filePath: string; mimeType: string } {
    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestError('File not found');
    }

    const ext = path.extname(safeName).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };

    return {
      filePath,
      mimeType: mimeMap[ext] || 'application/octet-stream',
    };
  }
}

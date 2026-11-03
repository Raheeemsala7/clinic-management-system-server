import { Request, Response } from 'express';
import { AttachmentsService } from '../services/attachments.service';
import { StorageService } from '../services/storage.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { BadRequestError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { config } from '../config/env';

export class AttachmentsController {
  getPresignedUrl = asyncHandler(async (req: Request, res: Response) => {
    const { fileName, mimeType, folder } = req.body;
    const result = await StorageService.getPresignedUploadUrl(fileName, mimeType, folder);
    sendSuccess(res, result, {
      message: 'Presigned upload URL generated successfully',
    });
  });

  upload = asyncHandler(async (req: Request, res: Response) => {
    // Accepts single file { name, data } or multiple { files: [...] }
    if (req.body.files && Array.isArray(req.body.files)) {
      const results = await AttachmentsService.saveMultipleFiles(req.body.files);
      sendSuccess(res, { attachments: results }, { code: 201, message: 'Files uploaded successfully' });
      return;
    }

    if (req.body.name && req.body.data) {
      const result = await AttachmentsService.saveFile(req.body.name, req.body.data);
      sendSuccess(res, { attachment: result }, { code: 201, message: 'File uploaded successfully' });
      return;
    }

    throw new BadRequestError('Request must include file data (name and base64 data)');
  });

  /**
   * Special case: Binary media file stream.
   * Directly sends raw binary file content with appropriate MIME headers,
   * streaming from Tigris S3 when available or local disk as fallback.
   */
  getFile = asyncHandler(async (req: Request, res: Response) => {
    const filename = req.params.filename;

    // 1. Try streaming from Tigris S3 if S3 driver is active
    if (config.storage.driver === 's3' && config.storage.accessKeyId) {
      try {
        const fileKey = `appointments/${filename}`;
        const { stream, contentType, contentLength } = await StorageService.getFileStream(fileKey);
        res.setHeader('Content-Type', contentType);
        if (contentLength) res.setHeader('Content-Length', contentLength);
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        return (stream as any).pipe(res);
      } catch (err: any) {
        // If not in S3, fall through to check local disk
      }
    }

    // 2. Local disk fallback
    const { filePath, mimeType } = AttachmentsService.getFilePath(filename);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.sendFile(filePath);
  });
}

export const attachmentsController = new AttachmentsController();

import { Request, Response } from 'express';
import { AttachmentsService } from '../services/attachments.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { BadRequestError } from '../utils/errors';
import { sendSuccess } from '../utils/response';

export class AttachmentsController {
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
   * Directly sends raw binary file content with appropriate MIME headers.
   */
  getFile = asyncHandler(async (req: Request, res: Response) => {
    const filename = req.params.filename;
    const { filePath, mimeType } = AttachmentsService.getFilePath(filename);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.sendFile(filePath);
  });
}

export const attachmentsController = new AttachmentsController();

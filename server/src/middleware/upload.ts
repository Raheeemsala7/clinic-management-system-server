import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { BadRequestError } from '../utils/errors';

const uploadDir = path.resolve(process.cwd(), config.storage.localPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadMiddleware = multer({
  limits: { fileSize: config.storage.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (config.storage.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only JPEG, PNG, WebP, and PDF files are allowed', 'INVALID_FILE_TYPE'));
    }
  },
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
});

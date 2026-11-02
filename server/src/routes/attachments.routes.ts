import { Router } from 'express';
import { attachmentsController } from '../controllers/attachments.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// File retrieval endpoint (public or token-bearing image tag)
router.get('/file/:filename', attachmentsController.getFile);

// Protected upload endpoints (ADMIN, DOCTOR, RECEPTION)
router.use(authMiddleware);
router.post('/presigned-url', attachmentsController.getPresignedUrl);
router.post('/upload', attachmentsController.upload);

export default router;

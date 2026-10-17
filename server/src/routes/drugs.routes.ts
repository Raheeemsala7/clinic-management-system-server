import { Router } from 'express';
import { drugsController } from '../controllers/drugs.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', requireRoles('ADMIN', 'DOCTOR'), drugsController.searchDrugs);

export default router;

import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/doctors', usersController.getDoctors);
router.get('/', requireRoles('ADMIN'), usersController.listUsers);
router.post('/', requireRoles('ADMIN'), usersController.createUser);
router.put('/:id', requireRoles('ADMIN'), usersController.updateUser);
router.delete('/:id', requireRoles('ADMIN'), usersController.deactivateUser);
router.post('/:id/reset-password', requireRoles('ADMIN'), usersController.resetPassword);

export default router;

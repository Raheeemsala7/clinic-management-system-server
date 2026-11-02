import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/response';

export class UsersController {
  getDoctors = asyncHandler(async (_req: Request, res: Response) => {
    const doctors = await UsersService.getDoctors();
    sendSuccess(res, doctors);
  });

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await UsersService.listUsers(
      req.query.page as string,
      req.query.pageSize as string,
    );
    sendPaginated(res, result);
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const user = await UsersService.createUser(req.body, req.user!.id, ip);
    sendSuccess(res, user, { code: 201, message: 'User created successfully' });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const user = await UsersService.updateUser(req.params.id, req.body, req.user!.id, ip);
    sendSuccess(res, user, { message: 'User updated successfully' });
  });

  deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const user = await UsersService.deactivateUser(req.params.id, req.user!.id, ip);
    sendSuccess(res, user, { message: 'User deactivated successfully' });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await UsersService.resetPassword(req.params.id, req.body.newPassword, req.user!.id, ip);
    sendSuccess(res, result, { message: 'Password reset successfully' });
  });
}

export const usersController = new UsersController();

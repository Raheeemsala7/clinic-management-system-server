import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class UsersController {
  getDoctors = asyncHandler(async (_req: Request, res: Response) => {
    const doctors = await UsersService.getDoctors();
    res.json(doctors);
  });

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await UsersService.listUsers(
      req.query.page as string,
      req.query.pageSize as string,
    );
    res.json(result);
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const user = await UsersService.createUser(req.body, req.user!.id, ip);
    res.status(201).json(user);
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const user = await UsersService.updateUser(req.params.id, req.body, req.user!.id, ip);
    res.json(user);
  });

  deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const user = await UsersService.deactivateUser(req.params.id, req.user!.id, ip);
    res.json(user);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await UsersService.resetPassword(req.params.id, req.body.newPassword, req.user!.id, ip);
    res.json(result);
  });
}

export const usersController = new UsersController();

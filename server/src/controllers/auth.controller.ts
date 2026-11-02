import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/response';

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] as string;
    const result = await authService.login(username, password, ip, userAgent);
    sendSuccess(res, result, { message: 'Logged in successfully' });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] as string;
    const result = await authService.refresh(refreshToken, ip, userAgent);
    sendSuccess(res, result, { message: 'Token refreshed successfully' });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (userId) {
      await authService.logout(userId);
    }
    sendSuccess(res, { success: true }, { message: 'Logged out successfully' });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  });

  getSocketTicket = asyncHandler(async (_req: Request, res: Response) => {
    const result = authService.getSocketTicket();
    sendSuccess(res, result);
  });
}

export const authController = new AuthController();

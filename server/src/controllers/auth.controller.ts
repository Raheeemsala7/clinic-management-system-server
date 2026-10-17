import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] as string;
    const result = await authService.login(username, password, ip, userAgent);
    res.json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] as string;
    const result = await authService.refresh(refreshToken, ip, userAgent);
    res.json(result);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (userId) {
      await authService.logout(userId);
    }
    res.json({ success: true });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    res.json(user);
  });
}

export const authController = new AuthController();

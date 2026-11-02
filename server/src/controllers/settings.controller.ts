import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/response';

export class SettingsController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getAll();
    sendSuccess(res, settings);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.update(req.body);
    sendSuccess(res, settings, { message: 'Settings updated successfully' });
  });
}

export const settingsController = new SettingsController();

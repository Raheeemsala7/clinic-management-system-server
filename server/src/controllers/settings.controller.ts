import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class SettingsController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getAll();
    res.json(settings);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.update(req.body);
    res.json(settings);
  });
}

export const settingsController = new SettingsController();

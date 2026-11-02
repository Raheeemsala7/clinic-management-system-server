import { Request, Response } from 'express';
import { DrugsService } from '../services/drugs.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../utils/response';

export class DrugsController {
  searchDrugs = asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const drugs = await DrugsService.searchDrugs(q);
    sendSuccess(res, drugs);
  });
}

export const drugsController = new DrugsController();

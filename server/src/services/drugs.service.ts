import { Drug } from '../models';

export class DrugsService {
  static async searchDrugs(query = '') {
    const filter: any = { isActive: true };

    if (query.trim()) {
      const safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: safeQuery, $options: 'i' };
    }

    const drugs = await Drug.find(filter)
      .sort({ usageCount: -1, name: 1 })
      .limit(20)
      .select('id name');

    return drugs.map((d) => ({ id: d.id, name: d.name }));
  }
}

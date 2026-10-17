import { Setting } from '../models';

const DEFAULT_SETTINGS: Record<string, string> = {
  clinicName: 'City Clinic',
  doctorDisplayName: 'Dr. Name',
  specialty: 'General Practice',
  address: '',
  phone: '',
  workingHoursText: 'Sat-Thu 9:00 AM - 5:00 PM',
  defaultConsultationFee: '0',
  currencyCode: 'EGP',
};

export class SettingsService {
  async getAll(): Promise<Record<string, string>> {
    const docs = await Setting.find();
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const doc of docs) {
      settings[doc._id] = doc.value;
    }
    return settings;
  }

  async update(body: Record<string, any>): Promise<Record<string, string>> {
    const updates = Object.entries(body).filter(([, v]) => v !== undefined && v !== null);

    await Promise.all(
      updates.map(([key, value]) =>
        Setting.findByIdAndUpdate(
          key,
          { _id: key, value: String(value) },
          { upsert: true, returnDocument: 'after' },
        ),
      ),
    );

    return this.getAll();
  }
}

export const settingsService = new SettingsService();

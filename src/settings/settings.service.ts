import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

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

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.setting.findMany();
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto): Promise<Record<string, string>> {
    const updates = Object.entries(dto).filter(([, v]) => v !== undefined);
    await Promise.all(
      updates.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        }),
      ),
    );
    return this.getAll();
  }
}

import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireRole(['ADMIN']);
  const { t } = await getServerI18n();

  const settings = await api.get<Record<string, string>>('/settings');

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}

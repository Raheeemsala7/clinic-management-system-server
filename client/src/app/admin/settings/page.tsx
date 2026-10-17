import { checkAuth } from '@/proxy';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  checkAuth(['ADMIN']);

  const settings = await api.get<Record<string, string>>('/settings');

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">{ar.settings.title}</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}

import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { todayClinicDate } from '@/lib/utils';
import { AdminClosingView, type ClosingPreview, type DailyClosingRecord } from './admin-closing-view';

export const dynamic = 'force-dynamic';

export default async function AdminClosingPage() {
  await requireRole(['ADMIN']);
  const { t } = await getServerI18n();

  const today = todayClinicDate();

  const [preview, currentClosing, history] = await Promise.all([
    api.get<ClosingPreview>(`/closing/preview?date=${today}`).catch(() => null),
    api.get<DailyClosingRecord | null>(`/closing/status?date=${today}`).catch(() => null),
    api.get<DailyClosingRecord[]>('/closing/history').catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.closing.title}</h1>
      </div>

      <AdminClosingView
        preview={preview}
        currentClosing={currentClosing}
        history={Array.isArray(history) ? history : []}
      />
    </div>
  );
}

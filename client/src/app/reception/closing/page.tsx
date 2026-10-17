import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney, todayClinicDate } from '@/lib/utils';
import { ClosingForm } from './closing-form';

export const dynamic = 'force-dynamic';

interface ClosingPreview {
  clinicDate: string;
  totalCashPayments: string;
  totalApprovedExpenses: string;
  expectedCash: string;
}

export default async function ReceptionClosingPage() {
  await requireRole(['RECEPTION', 'ADMIN']);

  const today = todayClinicDate();
  let preview: ClosingPreview | null = null;
  let alreadyClosed = false;

  try {
    const [p, s] = await Promise.all([
      api.get<ClosingPreview>(`/closing/preview?date=${today}`).catch(() => null),
      api.get<{ id: string; reopenedAt: string | null } | null>(`/closing/status?date=${today}`).catch(() => null),
    ]);
    preview = p;
    if (s && !s.reopenedAt) {
      alreadyClosed = true;
    }
  } catch {
    // fallback
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">{ar.closing.title}</h1>

      {alreadyClosed ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            {ar.closing.alreadyClosed}
          </CardContent>
        </Card>
      ) : preview ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{ar.closing.preview}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{ar.closing.expectedCash}</span>
                <span className="font-semibold">{formatMoney(preview.expectedCash)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{ar.closing.totalCashPayments}</span>
                <span>{formatMoney(preview.totalCashPayments)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{ar.closing.totalApprovedExpenses}</span>
                <span>- {formatMoney(preview.totalApprovedExpenses)}</span>
              </div>
            </CardContent>
          </Card>

          <ClosingForm expectedCash={preview.expectedCash} />
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">{ar.common.loading}</div>
      )}
    </div>
  );
}

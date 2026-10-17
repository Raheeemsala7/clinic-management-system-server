import { checkAuth } from '@/proxy';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatDate, formatTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  amount: string;
  method: 'CASH' | 'CARD' | 'WALLET';
  kind: 'CONSULTATION' | 'FOLLOW_UP' | 'OTHER';
  status: 'RECORDED' | 'VOIDED';
  voidReason: string | null;
  createdAt: string;
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { date?: string; page?: string };
}) {
  checkAuth(['ADMIN']);

  const params = new URLSearchParams();
  if (searchParams.date) params.set('date', searchParams.date);
  params.set('page', searchParams.page ?? '1');

  const result = await api.get<{ data: Payment[]; meta: { total: number } }>(
    `/payments?${params}`,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{ar.payments.title}</h1>
        {/* Date filter */}
        <form method="GET" className="flex gap-2">
          <input
            type="date"
            name="date"
            defaultValue={searchParams.date ?? ''}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="px-4 h-11 rounded-md bg-primary text-primary-foreground text-sm"
          >
            {ar.reports.apply}
          </button>
        </form>
      </div>

      <p className="text-sm text-muted-foreground">
        إجمالي: {result.meta.total} دفعة
      </p>

      <div className="space-y-2">
        {result.data.map((p) => (
          <Card key={p.id}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold">{formatMoney(p.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  {ar.payments[p.method]} • {ar.payments[p.kind]} • {formatTime(p.createdAt)}
                </p>
                {p.voidReason && (
                  <p className="text-xs text-destructive mt-0.5">سبب الإلغاء: {p.voidReason}</p>
                )}
              </div>
              <Badge variant={p.status === 'VOIDED' ? 'destructive' : 'default'}>
                {ar.payments[p.status]}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

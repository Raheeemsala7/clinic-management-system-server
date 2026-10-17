import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatTime } from '@/lib/utils';
import { CreditCard, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  amount: string;
  method: 'CASH' | 'CARD' | 'WALLET' | string;
  kind: 'CONSULTATION' | 'FOLLOW_UP' | 'OTHER' | string;
  status: 'RECORDED' | 'VOIDED';
  voidReason: string | null;
  createdAt: string;
}

interface AdminPaymentsPageProps {
  searchParams?: Promise<{ date?: string; page?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  await requireRole(['ADMIN']);

  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  if (resolved.date) params.set('date', resolved.date);
  params.set('page', resolved.page ?? '1');

  const result = await api
    .get<{ data: Payment[]; meta: { total: number } }>(`/payments?${params}`)
    .catch(() => ({ data: [], meta: { total: 0 } }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="size-6 text-primary" />
          {ar.payments.title}
        </h1>

        {/* Date filter */}
        <form method="GET" className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>التاريخ:</span>
          </div>
          <input
            type="date"
            name="date"
            defaultValue={resolved.date ?? ''}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            {ar.reports.apply}
          </button>
        </form>
      </div>

      <p className="text-xs text-muted-foreground font-semibold">
        الإجمالي: {result.meta.total} دفعة
      </p>

      <div className="space-y-2">
        {result.data.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground border-dashed">
            لا توجد مدفوعات مسجلة لهذا التاريخ
          </Card>
        ) : (
          result.data.map((p) => (
            <Card key={p.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-foreground text-base">{formatMoney(p.amount)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {((ar.payments as unknown as Record<string, string>)[p.method]) ?? p.method} • {((ar.payments as unknown as Record<string, string>)[p.kind]) ?? p.kind} • {formatTime(p.createdAt)}
                  </p>
                  {p.voidReason && (
                    <p className="text-xs text-destructive mt-1 font-medium">سبب الإلغاء: {p.voidReason}</p>
                  )}
                </div>
                <Badge variant={p.status === 'VOIDED' ? 'destructive' : 'default'} className={p.status === 'RECORDED' ? 'bg-emerald-600' : ''}>
                  {ar.payments[p.status]}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

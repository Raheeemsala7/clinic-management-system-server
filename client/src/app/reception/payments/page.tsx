import { checkAuth } from '@/proxy';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatTime, todayClinicDate } from '@/lib/utils';
import type { PaginatedResult } from '@/features/patients/queries';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  amount: string;
  method: 'CASH' | 'CARD' | 'WALLET';
  kind: 'CONSULTATION' | 'FOLLOW_UP' | 'OTHER';
  status: 'RECORDED' | 'VOIDED';
  createdAt: string;
}

export default async function ReceptionPaymentsPage() {
  checkAuth(['RECEPTION', 'ADMIN']);

  const today = todayClinicDate();
  const result = await api.get<PaginatedResult<Payment>>(`/payments?date=${today}`);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{ar.payments.title}</h1>
      <p className="text-sm text-muted-foreground">{ar.payments.todayOnly}</p>

      <div className="space-y-2">
        {result.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{ar.common.empty}</div>
        ) : (
          result.data.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold">{formatMoney(p.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {ar.payments[p.method]} • {ar.payments[p.kind]} • {formatTime(p.createdAt)}
                  </p>
                </div>
                <Badge variant={p.status === 'VOIDED' ? 'destructive' : 'default'}>
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

import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/i18n/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatDate } from '@/lib/utils';
import { ExpenseApprovalActions } from './expense-approval-actions';
import { Receipt, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Expense {
  id: string;
  amount: string;
  description: string;
  spentAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
}

export default async function AdminExpensesPage() {
  await requireRole(['ADMIN']);

  const [pending, all] = await Promise.all([
    api.get<{ data: Expense[] }>('/expenses?status=PENDING').catch(() => ({ data: [] })),
    api.get<{ data: Expense[] }>('/expenses').catch(() => ({ data: [] })),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="size-6 text-primary" />
            {ar.expenses.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة ومراجعة وموافقة على مصروفات العيادة
          </p>
        </div>
      </div>

      {/* Pending approvals */}
      {pending.data.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-700">
              {ar.expenses.pendingApprovals} ({pending.data.length})
            </h2>
          </div>
          <div className="space-y-2">
            {pending.data.map((e) => (
              <Card key={e.id} className="border-amber-300 bg-amber-50/30 shadow-sm">
                <CardContent className="py-3 px-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-bold text-foreground text-base">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      المبلغ: <span className="font-bold text-foreground">{formatMoney(e.amount)}</span> • تاريخ الصرف: {formatDate(e.spentAt)}
                    </p>
                  </div>
                  <ExpenseApprovalActions expenseId={e.id} description={e.description} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All expenses */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">{ar.expenses.allExpenses}</h2>
        {all.data.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <Receipt className="size-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-medium text-foreground">لا توجد أي مصروفات مسجلة بعد</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {all.data.map((e) => (
              <Card key={e.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-bold text-foreground text-sm">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      المبلغ: <span className="font-semibold text-foreground">{formatMoney(e.amount)}</span> • تاريخ الصرف: {formatDate(e.spentAt)}
                    </p>
                    {e.status === 'REJECTED' && e.rejectionReason && (
                      <p className="text-xs text-destructive mt-1">
                        سبب الرفض: {e.rejectionReason}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      e.status === 'APPROVED'
                        ? 'default'
                        : e.status === 'REJECTED'
                          ? 'destructive'
                          : 'outline'
                    }
                    className={e.status === 'APPROVED' ? 'bg-emerald-600' : ''}
                  >
                    {ar.expenses[e.status]}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

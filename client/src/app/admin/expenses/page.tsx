import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatDate } from '@/lib/utils';
import { ExpenseApprovalActions } from './expense-approval-actions';
import { Receipt, Clock } from 'lucide-react';

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
  const { t, locale, isAr } = await getServerI18n();

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
            {t.expenses.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr ? 'إدارة ومراجعة وموافقة على مصروفات العيادة' : 'Manage, review, and approve clinic expenses'}
          </p>
        </div>
      </div>

      {/* Pending approvals */}
      {pending.data.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-700">
              {t.expenses.pendingApprovals} ({pending.data.length})
            </h2>
          </div>
          <div className="space-y-2">
            {pending.data.map((e) => (
              <Card key={e.id} className="border-amber-300 bg-amber-50/30 shadow-sm">
                <CardContent className="py-3 px-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-bold text-foreground text-base">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {isAr ? 'المبلغ:' : 'Amount:'} <span className="font-bold text-foreground">{formatMoney(e.amount, locale)}</span> • {isAr ? 'تاريخ الصرف:' : 'Date:'} {formatDate(e.spentAt)}
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
        <h2 className="text-lg font-bold">{t.expenses.allExpenses}</h2>
        {all.data.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <Receipt className="size-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-medium text-foreground">
              {isAr ? 'لا توجد أي مصروفات مسجلة بعد' : 'No expenses recorded yet'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {all.data.map((e) => (
              <Card key={e.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-bold text-foreground text-sm">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? 'المبلغ:' : 'Amount:'} <span className="font-semibold text-foreground">{formatMoney(e.amount, locale)}</span> • {isAr ? 'تاريخ الصرف:' : 'Date:'} {formatDate(e.spentAt)}
                    </p>
                    {e.status === 'REJECTED' && e.rejectionReason && (
                      <p className="text-xs text-destructive mt-1">
                        {isAr ? 'سبب الرفض:' : 'Rejection Reason:'} {e.rejectionReason}
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
                    {t.expenses[e.status as keyof typeof t.expenses] || e.status}
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

import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatDate } from '@/lib/utils';
import { ExpenseForm } from './expense-form';

export const dynamic = 'force-dynamic';

interface ExpenseCategory { id: string; name: string; }
interface Expense {
  id: string;
  amount: string;
  description: string;
  spentAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category?: { name: string };
}

export default async function ReceptionExpensesPage() {
  await requireRole(['RECEPTION', 'ADMIN']);
  const { t, locale, isAr } = await getServerI18n();

  const [expenses, categories] = await Promise.all([
    api.get<{ data: Expense[] }>('/expenses').catch(() => ({ data: [] })),
    api.get<ExpenseCategory[]>('/expense-categories').catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{t.expenses.title}</h1>
        <p className="text-sm text-muted-foreground">
          {isAr ? 'تسجيل مصروفات العيادة ومتابعة حالة الاعتماد' : 'Record clinic expenses and track approval status'}
        </p>
      </div>

      {/* Add expense form */}
      <Card className="shadow-sm border-2 border-primary/20">
        <CardContent className="pt-5">
          <ExpenseForm categories={categories} />
        </CardContent>
      </Card>

      {/* Expenses list */}
      <div className="space-y-2">
        {expenses.data.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">{t.common.empty}</div>
        ) : (
          expenses.data.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium">{e.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(e.amount, locale)} • {formatDate(e.spentAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    e.status === 'APPROVED'
                      ? 'default'
                      : e.status === 'REJECTED'
                        ? 'destructive'
                        : 'outline'
                  }
                >
                  {t.expenses[e.status as keyof typeof t.expenses] || e.status}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

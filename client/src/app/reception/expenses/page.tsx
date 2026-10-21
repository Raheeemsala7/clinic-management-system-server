import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/i18n/messages/ar';
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

  const [expenses, categories] = await Promise.all([
    api.get<{ data: Expense[] }>('/expenses').catch(() => ({ data: [] })),
    api.get<ExpenseCategory[]>('/expense-categories').catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{ar.expenses.title}</h1>
        <p className="text-sm text-muted-foreground">تسجيل مصروفات العيادة ومتابعة حالة الاعتماد</p>
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
          <div className="text-center py-10 text-muted-foreground">{ar.common.empty}</div>
        ) : (
          expenses.data.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium">{e.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(e.amount)} â€¢ {formatDate(e.spentAt)}
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
                  {ar.expenses[e.status]}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

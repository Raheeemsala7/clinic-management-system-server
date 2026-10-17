import { checkAuth } from '@/proxy';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatDate } from '@/lib/utils';

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
  checkAuth(['RECEPTION', 'ADMIN']);

  const [expenses, categories] = await Promise.all([
    api.get<{ data: Expense[] }>('/expenses'),
    api.get<ExpenseCategory[]>('/expense-categories'),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{ar.expenses.title}</h1>

      {/* Add expense form */}
      <Card>
        <CardContent className="pt-4">
          <form method="POST" action="/api/expenses/create" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{ar.expenses.category}</label>
                <select
                  name="categoryId"
                  required
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">{ar.expenses.category}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{ar.expenses.amount}</label>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{ar.expenses.description}</label>
              <input
                name="description"
                type="text"
                required
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              {ar.expenses.newExpense}
            </button>
          </form>
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
                    {formatMoney(e.amount)} • {formatDate(e.spentAt)}
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

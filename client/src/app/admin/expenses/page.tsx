import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatDate } from '@/lib/utils';
import { approveExpenseAction } from '@/features/expenses/actions';

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
    api.get<{ data: Expense[] }>('/expenses?status=PENDING'),
    api.get<{ data: Expense[] }>('/expenses'),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ar.expenses.title}</h1>

      {/* Pending approvals */}
      {pending.data.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-amber-600">
            {ar.expenses.pendingApprovals} ({pending.data.length})
          </h2>
          <div className="space-y-2">
            {pending.data.map((e) => (
              <Card key={e.id} className="border-amber-200">
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{e.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(e.amount)} â€¢ {formatDate(e.spentAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={async () => { await approveExpenseAction(e.id); }}>
                      <button
                        type="submit"
                        className="px-3 h-9 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
                      >
                        {ar.expenses.approve}
                      </button>
                    </form>
                    <a
                      href={`/admin/expenses/${e.id}/reject`}
                      className="px-3 h-9 flex items-center rounded-md border border-destructive text-destructive text-sm hover:bg-destructive/10"
                    >
                      {ar.expenses.reject}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All expenses */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{ar.expenses.allExpenses}</h2>
        <div className="space-y-2">
          {all.data.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1">
                  <p>{e.description}</p>
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
          ))}
        </div>
      </section>
    </div>
  );
}

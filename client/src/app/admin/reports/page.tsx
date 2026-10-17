import { checkAuth } from '@/proxy';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney, todayClinicDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface SummaryReport {
  from: string;
  to: string;
  income: string;
  expenses: string;
  net: string;
  visitCount: number;
  avgPerVisit: string;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  checkAuth(['ADMIN']);

  const today = todayClinicDate();
  const from = searchParams.from ?? today.slice(0, 7) + '-01';
  const to = searchParams.to ?? today;

  const [summary, byDay, byCategory, byMethod] = await Promise.all([
    api.get<SummaryReport>(`/reports/summary?from=${from}&to=${to}`),
    api.get<Array<{ day: string; total: string }>>(`/reports/income-by-day?from=${from}&to=${to}`),
    api.get<Array<{ category: string; total: string }>>(`/reports/expenses-by-category?from=${from}&to=${to}`),
    api.get<Array<{ method: string; total: string; count: string }>>(`/reports/payments-by-method?from=${from}&to=${to}`),
  ]);

  const metrics = [
    { label: ar.reports.income, value: formatMoney(summary.income) },
    { label: ar.reports.expenses, value: formatMoney(summary.expenses) },
    { label: ar.reports.net, value: formatMoney(summary.net), highlight: parseFloat(summary.net) >= 0 },
    { label: ar.reports.visits, value: String(summary.visitCount) },
    { label: ar.reports.avgPerVisit, value: formatMoney(summary.avgPerVisit) },
  ];

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{ar.reports.title}</h1>
        <form method="GET" className="flex gap-2 items-center flex-wrap">
          <label className="text-sm">{ar.reports.from}</label>
          <input type="date" name="from" defaultValue={from} className="h-10 rounded-md border px-2 text-sm" />
          <label className="text-sm">{ar.reports.to}</label>
          <input type="date" name="to" defaultValue={to} className="h-10 rounded-md border px-2 text-sm" />
          <button type="submit" className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm">
            {ar.reports.apply}
          </button>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground">{m.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className={`text-xl font-bold ${m.highlight === false ? 'text-destructive' : ''}`}>
                {m.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income by day */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{ar.reports.incomeByDay}</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-start">{ar.common.date}</th>
                <th className="px-4 py-2 text-start">{ar.reports.income}</th>
              </tr>
            </thead>
            <tbody>
              {byDay.map((row) => (
                <tr key={row.day} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-2">{row.day}</td>
                  <td className="px-4 py-2 font-medium">{formatMoney(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Expenses by category */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{ar.reports.expensesByCategory}</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-start">{ar.expenses.category}</th>
                <th className="px-4 py-2 text-start">{ar.common.amount}</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((row) => (
                <tr key={row.category} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-2">{row.category}</td>
                  <td className="px-4 py-2 font-medium">{formatMoney(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payments by method */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{ar.reports.paymentsByMethod}</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-start">{ar.payments.method}</th>
                <th className="px-4 py-2 text-start">{ar.common.amount}</th>
                <th className="px-4 py-2 text-start">العدد</th>
              </tr>
            </thead>
            <tbody>
              {byMethod.map((row) => (
                <tr key={row.method} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-2">{ar.payments[row.method as keyof typeof ar.payments] ?? row.method}</td>
                  <td className="px-4 py-2 font-medium">{formatMoney(row.total)}</td>
                  <td className="px-4 py-2">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

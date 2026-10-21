import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney, todayClinicDate } from '@/lib/utils';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Wallet } from 'lucide-react';

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

interface AdminReportsPageProps {
  searchParams?: Promise<{ from?: string; to?: string }>;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  await requireRole(['ADMIN']);
  const { t, locale, isAr } = await getServerI18n();

  const today = todayClinicDate();
  const resolved = searchParams ? await searchParams : undefined;
  const from = resolved?.from ?? today.slice(0, 7) + '-01';
  const to = resolved?.to ?? today;

  const defaultSummary: SummaryReport = {
    from,
    to,
    income: '0',
    expenses: '0',
    net: '0',
    visitCount: 0,
    avgPerVisit: '0.00',
  };

  const [summary, byDay, byCategory, byMethod] = await Promise.all([
    api.get<SummaryReport>(`/reports/summary?from=${from}&to=${to}`).catch(() => defaultSummary),
    api.get<Array<{ day: string; total: string }>>(`/reports/income-by-day?from=${from}&to=${to}`).catch(() => []),
    api.get<Array<{ category: string; total: string }>>(`/reports/expenses-by-category?from=${from}&to=${to}`).catch(() => []),
    api.get<Array<{ method: string; total: string; count: string }>>(`/reports/payments-by-method?from=${from}&to=${to}`).catch(() => []),
  ]);

  const netNumber = parseFloat(summary.net || '0');

  const metrics = [
    { label: t.reports.income, value: formatMoney(summary.income, locale), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: t.reports.expenses, value: formatMoney(summary.expenses, locale), icon: TrendingDown, color: 'text-red-600 bg-red-50' },
    {
      label: t.reports.net,
      value: formatMoney(summary.net, locale),
      highlight: netNumber >= 0,
      icon: DollarSign,
      color: netNumber >= 0 ? 'text-primary bg-primary/10' : 'text-destructive bg-destructive/10',
    },
    { label: t.reports.visits, value: String(summary.visitCount), icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: t.reports.avgPerVisit, value: formatMoney(summary.avgPerVisit, locale), icon: Wallet, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" />
            {t.reports.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr
              ? 'تقرير الإيرادات والمصروفات وصافي الأرباح للفترة المحددة'
              : 'Revenue, expenses, and net profit report for the selected period'}
          </p>
        </div>

        <form method="GET" className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>{t.reports.from}:</span>
          </div>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground ms-2">
            <span>{t.reports.to}:</span>
          </div>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm ms-2"
          >
            {t.reports.apply}
          </button>
        </form>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="shadow-sm">
              <CardHeader className="pb-1 pt-3.5 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground">{m.label}</CardTitle>
                <div className={`size-8 rounded-lg flex items-center justify-center ${m.color}`}>
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3.5">
                <p className={`text-xl font-black mt-1 ${m.highlight === false ? 'text-destructive' : 'text-foreground'}`}>
                  {m.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by day */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-600" />
            {t.reports.incomeByDay}
          </h2>
          <Card className="shadow-sm overflow-hidden border">
            {byDay.length === 0 ? (
              <p className="p-8 text-center text-xs text-muted-foreground">
                {isAr ? 'لا توجد إيرادات مسجلة في هذه الفترة' : 'No income recorded for this period'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.common.date}</th>
                      <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.reports.income}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {byDay.map((row) => (
                      <tr key={row.day} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.day}</td>
                        <td className="px-4 py-2.5 font-bold text-emerald-600 text-sm">{formatMoney(row.total, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        {/* Expenses by category */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="size-4 text-red-600" />
            {t.reports.expensesByCategory}
          </h2>
          <Card className="shadow-sm overflow-hidden border">
            {byCategory.length === 0 ? (
              <p className="p-8 text-center text-xs text-muted-foreground">
                {isAr ? 'لا توجد مصروفات مسجلة في هذه الفترة' : 'No expenses recorded for this period'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.expenses.category}</th>
                      <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.common.amount}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {byCategory.map((row) => (
                      <tr key={row.category} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-xs text-foreground">{row.category}</td>
                        <td className="px-4 py-2.5 font-bold text-red-600 text-sm">{formatMoney(row.total, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* Payments by method */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Wallet className="size-4 text-primary" />
          {t.reports.paymentsByMethod}
        </h2>
        <Card className="shadow-sm overflow-hidden border">
          {byMethod.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground">
              {isAr ? 'لا توجد مدفوعات مسجلة في هذه الفترة' : 'No payments recorded for this period'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.payments.method}</th>
                    <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.common.amount}</th>
                    <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.common.count}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {byMethod.map((row) => (
                    <tr key={row.method} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-xs text-foreground">
                        {t.payments[row.method as keyof typeof t.payments] ?? row.method}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-foreground text-sm">{formatMoney(row.total, locale)}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

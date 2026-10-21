import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerI18n } from '@/i18n/server';
import { formatMoney, todayClinicDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface SummaryReport {
  income: string;
  expenses: string;
  net: string;
  visitCount: number;
  avgPerVisit: string;
}

export default async function AdminDashboardPage() {
  await requireRole(['ADMIN']);
  const { t, locale } = await getServerI18n();

  const today = todayClinicDate();
  const monthStart = today.slice(0, 7) + '-01';

  let summary: SummaryReport | null = null;
  try {
    summary = await api.get<SummaryReport>(
      `/reports/summary?from=${monthStart}&to=${today}`,
    );
  } catch {
    // Summary may fail if no data — show zeros
  }

  const metrics = [
    { label: t.reports.income, value: formatMoney(summary?.income ?? '0', locale) },
    { label: t.reports.expenses, value: formatMoney(summary?.expenses ?? '0', locale) },
    { label: t.reports.net, value: formatMoney(summary?.net ?? '0', locale) },
    { label: t.reports.visits, value: String(summary?.visitCount ?? 0) },
    { label: t.reports.avgPerVisit, value: formatMoney(summary?.avgPerVisit ?? '0', locale) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.nav.dashboard}</h1>
        <p className="text-sm text-muted-foreground">
          {t.reports.from} {monthStart} {t.reports.to} {today}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold text-foreground">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/payments', label: t.nav.payments },
          { href: '/admin/expenses', label: t.nav.expenses },
          { href: '/admin/closing', label: t.nav.closing },
          { href: '/admin/reports', label: t.nav.reports },
          { href: '/admin/users', label: t.nav.users },
          { href: '/admin/settings', label: t.nav.settings },
          { href: '/admin/audit', label: t.nav.audit },
          { href: '/admin/patients', label: t.nav.patients },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center justify-center rounded-lg border bg-card p-4 text-sm font-medium hover:bg-secondary transition-colors min-h-touch"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

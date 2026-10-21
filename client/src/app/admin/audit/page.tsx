import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { formatDateTime } from '@/lib/utils';
import { ShieldCheck, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ip: string | null;
  createdAt: string;
  user: { name: string; username: string; role: string };
}

interface AdminAuditPageProps {
  searchParams?: Promise<{
    userId?: string;
    entityType?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  await requireRole(['ADMIN']);
  const { t, isAr } = await getServerI18n();

  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  if (resolved.userId) params.set('userId', resolved.userId);
  if (resolved.entityType) params.set('entityType', resolved.entityType);
  if (resolved.from) params.set('from', resolved.from);
  if (resolved.to) params.set('to', resolved.to);
  params.set('page', resolved.page ?? '1');
  params.set('pageSize', '50');

  const result = await api
    .get<{
      data: AuditLog[];
      meta: { total: number; page: number; totalPages: number };
    }>(`/audit-logs?${params.toString()}`)
    .catch(() => ({
      data: [],
      meta: { total: 0, page: 1, totalPages: 1 },
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            {t.audit.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr ? 'سجل العمليات والأمان لجميع الحركات داخل النظام' : 'Security and audit log for all system actions'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 shadow-sm border">
        <form method="GET" className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[180px]">
            <input
              name="entityType"
              defaultValue={resolved.entityType ?? ''}
              placeholder={isAr ? 'نوع العنصر (مثال: Patient, Appointment)' : 'Entity type (e.g. Patient, Appointment)'}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>{t.reports.from}:</span>
            <input
              type="date"
              name="from"
              defaultValue={resolved.from ?? ''}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{t.reports.to}:</span>
            <input
              type="date"
              name="to"
              defaultValue={resolved.to ?? ''}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t.reports.apply}
          </button>
        </form>
      </Card>

      <p className="text-xs text-muted-foreground font-semibold">
        {isAr ? 'الإجمالي:' : 'Total:'} {result.meta.total} {isAr ? 'سجل' : 'records'}
      </p>

      <Card className="shadow-sm border overflow-hidden">
        {result.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            {isAr ? 'لا توجد سجلات أمان مطابقة للبحث' : 'No audit records match the search'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.audit.time}</th>
                  <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.audit.user}</th>
                  <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.audit.action}</th>
                  <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.audit.entity}</th>
                  <th className="px-4 py-2.5 text-start text-xs font-bold text-muted-foreground">{t.audit.ip}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground font-mono text-xs">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-foreground text-xs">{log.user.name}</span>
                      <br />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {t.roles[log.user.role as keyof typeof t.roles] ?? log.user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">{log.action}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {log.entityType}
                      {log.entityId && <span className="text-muted-foreground"> #{log.entityId.slice(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{log.ip ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

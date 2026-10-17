import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { formatDateTime } from '@/lib/utils';

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

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: { userId?: string; entityType?: string; from?: string; to?: string; page?: string };
}) {
  await requireRole(['ADMIN']);

  const params = new URLSearchParams();
  if (searchParams.userId) params.set('userId', searchParams.userId);
  if (searchParams.entityType) params.set('entityType', searchParams.entityType);
  if (searchParams.from) params.set('from', searchParams.from);
  if (searchParams.to) params.set('to', searchParams.to);
  params.set('page', searchParams.page ?? '1');
  params.set('pageSize', '50');

  const result = await api.get<{
    data: AuditLog[];
    meta: { total: number; page: number; totalPages: number };
  }>(`/audit-logs?${params.toString()}`);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{ar.audit.title}</h1>

      {/* Filters */}
      <form method="GET" className="flex gap-2 flex-wrap">
        <input
          name="entityType"
          defaultValue={searchParams.entityType ?? ''}
          placeholder={ar.audit.entity}
          className="h-10 rounded-md border px-3 text-sm"
        />
        <input type="date" name="from" defaultValue={searchParams.from ?? ''} className="h-10 rounded-md border px-3 text-sm" />
        <input type="date" name="to" defaultValue={searchParams.to ?? ''} className="h-10 rounded-md border px-3 text-sm" />
        <button type="submit" className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm">
          {ar.reports.apply}
        </button>
      </form>

      <p className="text-sm text-muted-foreground">ط¥ط¬ظ…ط§ظ„ظٹ: {result.meta.total} ط³ط¬ظ„</p>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-start">{ar.audit.time}</th>
              <th className="px-3 py-2 text-start">{ar.audit.user}</th>
              <th className="px-3 py-2 text-start">{ar.audit.action}</th>
              <th className="px-3 py-2 text-start">{ar.audit.entity}</th>
              <th className="px-3 py-2 text-start">{ar.audit.ip}</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((log) => (
              <tr key={log.id} className="border-t hover:bg-muted/10">
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-3 py-2">
                  <span className="font-medium">{log.user.name}</span>
                  <br />
                  <span className="text-xs text-muted-foreground">{ar.roles[log.user.role as keyof typeof ar.roles]}</span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{log.action}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  {log.entityType}
                  {log.entityId && <span className="text-muted-foreground"> #{log.entityId.slice(0, 8)}</span>}
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">{log.ip ?? 'â€”'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


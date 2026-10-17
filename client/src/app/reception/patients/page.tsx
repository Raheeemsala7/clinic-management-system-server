import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, computeAge } from '@/lib/utils';
import type { PaginatedResult, PatientBasic } from '@/features/patients/queries';

export const dynamic = 'force-dynamic';

interface ReceptionPatientsPageProps {
  searchParams?: Promise<{ q?: string; page?: string }>;
}

export default async function ReceptionPatientsPage({ searchParams }: ReceptionPatientsPageProps) {
  await requireRole(['RECEPTION', 'ADMIN']);

  const resolved = searchParams ? await searchParams : {};
  const q = resolved.q ?? '';
  const page = Number(resolved.page) || 1;
  const params = new URLSearchParams({ q, page: String(page), pageSize: '20' });
  const result = await api
    .get<PaginatedResult<PatientBasic>>(`/patients?${params}`)
    .catch(() => ({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{ar.patients.title}</h1>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder={ar.patients.search}
          className="flex h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={ar.patients.search}
        />
        <button
          type="submit"
          className="px-4 h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          {ar.common.search}
        </button>
      </form>

      {/* Results */}
      <div className="space-y-2">
        {result.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{ar.common.empty}</div>
        ) : (
          result.data.map((patient) => (
            <Card key={patient.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{patient.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.phone}
                    {patient.dateOfBirth && ` • ${computeAge(patient.dateOfBirth)} ${ar.patients.years}`}
                  </p>
                </div>
                <Badge variant="outline">
                  {patient.gender === 'MALE' ? ar.patients.male : ar.patients.female}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?q=${q}&page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

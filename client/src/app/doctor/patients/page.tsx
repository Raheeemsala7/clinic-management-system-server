import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { DoctorPatientsView } from './doctor-patients-view';
import type { PaginatedResult, PatientBasic } from '@/features/patients/queries';

export const dynamic = 'force-dynamic';

interface DoctorPatientsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function DoctorPatientsPage({ searchParams }: DoctorPatientsPageProps) {
  await requireRole(['DOCTOR', 'ADMIN']);
  const { t, isAr } = await getServerI18n();

  const resolvedParams = await searchParams;
  const q = resolvedParams.q ?? '';
  const page = Number(resolvedParams.page) || 1;
  const params = new URLSearchParams({ q, page: String(page), pageSize: '20' });

  const result = await api
    .get<PaginatedResult<PatientBasic>>(`/patients?${params}`)
    .catch(() => ({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t.patients.title}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? `البحث في السجلات الطبية للمرضى وعرض التاريخ المرضي والحساسيات (${result.meta.total} ${t.patients.title})`
              : `Search medical records, view patient history and allergies (${result.meta.total} ${t.patients.title})`}
          </p>
        </div>
      </div>

      <DoctorPatientsView
        initialPatients={result.data}
        total={result.meta.total}
        totalPages={result.meta.totalPages}
        currentPage={page}
        query={q}
      />
    </div>
  );
}

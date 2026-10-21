import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { computeAge, formatDate } from '@/lib/utils';
import { NewPatientDialog } from './new-patient-dialog';
import type { PaginatedResult, PatientBasic } from '@/features/patients/queries';
import { Search, Users, Phone, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface AdminPatientsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminPatientsPage({ searchParams }: AdminPatientsPageProps) {
  await requireRole(['ADMIN']);
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
            {isAr ? 'إدارة سجلات المرضى والبيانات الشخصية' : 'Manage patient records and profiles'} ({result.meta.total} {t.patients.title})
          </p>
        </div>
        <NewPatientDialog />
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder={t.patients.searchPlaceholder}
                className="flex h-10 w-full rounded-md border border-input bg-background ps-9 pe-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={t.patients.search}
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-5">
              {t.common.search}
            </Button>
            {q && (
              <Button variant="outline" size="sm" asChild className="h-10">
                <Link href="/admin/patients">{t.common.reset}</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="space-y-3">
        {result.data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-lg border">
            <Users className="size-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="font-medium">{t.common.noData}</p>
            {q && (
              <p className="text-xs text-muted-foreground mt-1">
                {isAr ? 'جرب البحث بكلمات مختلفة أو رقم هاتف آخر' : 'Try searching with different terms or phone number'}
              </p>
            )}
          </div>
        ) : (
          result.data.map((patient) => {
            const age = computeAge(patient.dateOfBirth, patient.age);
            return (
              <Card key={patient.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3.5 min-w-[220px]">
                    <div className="size-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                      {patient.fullName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{patient.fullName}</p>
                        <Badge variant="outline" className="text-xs font-normal">
                          {patient.gender === 'MALE' ? t.patients.male : t.patients.female}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="size-3 text-muted-foreground" />
                          {patient.phone}
                        </span>
                        {age !== null && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            {age} {t.patients.years}
                          </span>
                        )}
                        {patient.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-muted-foreground" />
                            {patient.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDate(patient.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-4">
          {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              className="size-9 p-0"
              asChild
            >
              <Link href={`?q=${q}&page=${p}`}>{p}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ar } from '@/i18n/messages/ar';
import { computeAge, formatDate } from '@/lib/utils';
import { PatientMedicalDrawer } from './patient-medical-drawer';
import { FileText, Phone, MapPin, Calendar, AlertCircle, HeartPulse, Loader2, Search } from 'lucide-react';
import type { PatientBasic, PatientSummary } from '@/features/patients/queries';
import Link from 'next/link';

import { getPatientSummaryAction } from '@/features/patients/actions';

interface DoctorPatientsViewProps {
  initialPatients: PatientBasic[];
  total: number;
  totalPages: number;
  currentPage: number;
  query: string;
}

export function DoctorPatientsView({
  initialPatients,
  total,
  totalPages,
  currentPage,
  query,
}: DoctorPatientsViewProps) {
  const [selectedSummary, setSelectedSummary] = useState<PatientSummary | null>(null);
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenMedicalFile = async (patient: PatientBasic) => {
    setLoadingPatientId(patient.id);
    try {
      const data = await getPatientSummaryAction(patient.id);
      if (data) {
        setSelectedSummary(data);
      } else {
        setSelectedSummary({
          id: patient.id,
          fullName: patient.fullName,
          age: patient.dateOfBirth ? computeAge(patient.dateOfBirth) : null,
          gender: patient.gender,
          allergies: [],
          chronicConditions: [],
          visitCount: 0,
          lastVisitDate: null,
          lastDiagnosis: null,
          lastPrescriptionItems: [],
        });
      }
      setDrawerOpen(true);
    } catch {
      setSelectedSummary({
        id: patient.id,
        fullName: patient.fullName,
        age: computeAge(patient.dateOfBirth, patient.age),
        gender: patient.gender,
        allergies: [],
        chronicConditions: [],
        visitCount: 0,
        lastVisitDate: null,
        lastDiagnosis: null,
        lastPrescriptionItems: [],
      });
      setDrawerOpen(true);
    } finally {
      setLoadingPatientId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                name="q"
                defaultValue={query}
                placeholder={ar.patients.searchPlaceholder}
                className="flex h-10 w-full rounded-md border border-input bg-background ps-9 pe-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={ar.patients.search}
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-5">
              {ar.common.search}
            </Button>
            {query && (
              <Button variant="outline" size="sm" asChild className="h-10">
                <Link href="/doctor/patients">{ar.common.reset}</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Patient Cards */}
      <div className="space-y-3">
        {initialPatients.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-lg border">
            <p className="font-medium">{ar.common.noData}</p>
            {query && <p className="text-xs text-muted-foreground mt-1">لا توجد نتائج مطابقة لبحثك</p>}
          </div>
        ) : (
          initialPatients.map((patient) => {
            const age = patient.dateOfBirth ? computeAge(patient.dateOfBirth) : null;
            const isLoadingThis = loadingPatientId === patient.id;

            return (
              <Card
                key={patient.id}
                className="shadow-sm hover:shadow-md transition-shadow border-border hover:border-primary/40 group"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <Link
                    href={`/doctor/patients/${patient.id}`}
                    className="flex items-center gap-3.5 min-w-[240px] flex-1 cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {patient.fullName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                          {patient.fullName}
                        </p>
                        <Badge variant="outline" className="text-xs font-normal">
                          {patient.gender === 'MALE' ? ar.patients.male : ar.patients.female}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="size-3" />
                          {patient.phone}
                        </span>
                        {age !== null && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {age} {ar.patients.years}
                          </span>
                        )}
                        {patient.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {patient.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1.5 text-xs font-bold text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
                    >
                      <Link href={`/doctor/patients/${patient.id}`}>
                        <FileText className="size-3.5" />
                        زيارات وتقرير المريض
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === currentPage ? 'default' : 'outline'}
              size="sm"
              className="size-9 p-0"
              asChild
            >
              <Link href={`?q=${query}&page=${p}`}>{p}</Link>
            </Button>
          ))}
        </div>
      )}

      {/* Medical Drawer Modal */}
      <PatientMedicalDrawer
        summary={selectedSummary}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

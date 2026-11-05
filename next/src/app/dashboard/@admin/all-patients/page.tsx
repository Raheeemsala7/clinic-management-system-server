import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { PatientsSearchFilterBar } from '@/features/patient/components/patients-search-filter-bar';
import { PatientsSearchFilterBarSkeleton } from '@/features/patient/components/patients-search-filter-bar-skeleton';
import { TablePatientsReception } from '@/features/patient/components/table-patients-reception';
import { TablePatientsSkeleton } from '@/features/patient/components/table-patients-skeleton';
import { TablePatientsError } from '@/features/patient/components/table-patients-error';
import { GetPatientsParams } from '@/features/patient/apis/patient.api';

interface AllPatientsPageProps {
  searchParams: Promise<GetPatientsParams>;
}

export const metadata = {
  title: 'سجل كافة المرضى | الإدارة',
  description: 'إدارة وسجلات وبحث المرضى في العيادة للوحة الإدارة',
};

export default function AdminAllPatientsPage({ searchParams }: AllPatientsPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      <Suspense fallback={<PatientsSearchFilterBarSkeleton />}>
        <PatientsSearchFilterBar />
      </Suspense>

      <ErrorBoundary errorComponent={TablePatientsError}>
        <Suspense fallback={<TablePatientsSkeleton />}>
          <TablePatientsReception searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

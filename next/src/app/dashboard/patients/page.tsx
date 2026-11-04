import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { PatientsSearchFilterBar } from '@/features/patient/components/patients-search-filter-bar';
import { TablePatientsReception } from '@/features/patient/components/table-patients-reception';
import { TablePatientsSkeleton } from '@/features/patient/components/table-patients-skeleton';
import { TablePatientsError } from '@/features/patient/components/table-patients-error';
import { GetPatientsParams } from '@/features/patient/apis/patient.api';

interface PatientsPageProps {
  searchParams: Promise<GetPatientsParams>;
}

export const metadata = {
  title: 'سجل المرضى | العيادة',
  description: 'إدارة وبحث وسجلات المرضى في العيادة',
};

export default async function ReceptionistPatientsPage({ searchParams }: PatientsPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. شريط البحث والفلترة وزر إضافة مريض جديد (مع Debounce) */}
      <PatientsSearchFilterBar />

      {/* 2. جدول المرضى كـ Server Component مع معالجة الأخطاء والـ Suspense */}
      <ErrorBoundary errorComponent={TablePatientsError}>
        <Suspense fallback={<TablePatientsSkeleton />}>
          <TablePatientsReception searchParams={resolvedParams} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

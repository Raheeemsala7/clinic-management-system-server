import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { PatientsSearchFilterBar } from '@/features/patient/components/patients-search-filter-bar';
import { PatientsSearchFilterBarSkeleton } from '@/features/patient/components/patients-search-filter-bar-skeleton';
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

export default function ReceptionistPatientsPage({ searchParams }: PatientsPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. شريط البحث والفلترة وزر إضافة مريض جديد داخل Suspense لدعم useSearchParams وتفادي بطء التحميل */}
      <Suspense fallback={<PatientsSearchFilterBarSkeleton />}>
        <PatientsSearchFilterBar />
      </Suspense>

      {/* 2. جدول المرضى كـ Server Component مع معالجة الأخطاء والـ Suspense وتمرير searchParams كـ Promise */}
      <ErrorBoundary errorComponent={TablePatientsError}>
        <Suspense fallback={<TablePatientsSkeleton />}>
          <TablePatientsReception searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

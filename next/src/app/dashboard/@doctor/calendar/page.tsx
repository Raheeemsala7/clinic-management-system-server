import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { AppointmentsCalendarServer } from '@/features/appointments/components/appointments-calendar-server';
import { AppointmentsCalendarSkeleton } from '@/features/appointments/components/appointments-calendar-skeleton';
import { AppointmentsCalendarError } from '@/features/appointments/components/appointments-calendar-error';
import { CalendarViewMode } from '@/features/appointments/types/calendar';

export const metadata: Metadata = {
  title: 'تقويم مواعيدي | العيادة',
  description: 'عرض الفترات الزمنية الشاغرة والمحجوزة الخاصة بالطبيب',
};

interface DoctorCalendarPageProps {
  searchParams: Promise<{
    date?: string;
    doctorId?: string;
    view?: CalendarViewMode;
  }>;
}

export default function DoctorCalendarPage({
  searchParams,
}: DoctorCalendarPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* ترويسة صفحة جدول مواعيد الطبيب */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0A164E] tracking-tight">
          تقويم المواعيد والحجوزات
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-400">
          جدول مواعيدك الخاصة والفترات الزمنية المتاحة للكشوفات والمراجعات
        </p>
      </div>

      {/* التقويم وجدول الفترات والمواعيد الخاصة بالطبيب */}
      <ErrorBoundary errorComponent={AppointmentsCalendarError}>
        <Suspense fallback={<AppointmentsCalendarSkeleton />}>
          <AppointmentsCalendarServer searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}


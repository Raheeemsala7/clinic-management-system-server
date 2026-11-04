import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { AppointmentsCalendarServer } from '@/features/appointments/components/appointments-calendar-server';
import { AppointmentsCalendarSkeleton } from '@/features/appointments/components/appointments-calendar-skeleton';
import { AppointmentsCalendarError } from '@/features/appointments/components/appointments-calendar-error';
import { CalendarViewMode } from '@/features/appointments/types/calendar';

export const metadata: Metadata = {
  title: 'تقويم المواعيد والحجوزات | العيادة',
  description: 'عرض الفترات الزمنية الشاغرة والمحجوزة بالساعة لكل طبيب وإدارة حجوزات العيادة',
};

interface ReceptionistAppointmentsPageProps {
  searchParams: Promise<{
    date?: string;
    doctorId?: string;
    view?: CalendarViewMode;
  }>;
}

export default function ReceptionistAppointmentsPage({
  searchParams,
}: ReceptionistAppointmentsPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. ترويسة الصفحة مطابقة للتصميم */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0A164E] tracking-tight">
          تقويم المواعيد والحجوزات
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-400">
          عرض الفترات الزمنية الشاغرة والمحجوزة بالساعة لكل طبيب وإدارة حجوزات العيادة
        </p>
      </div>

      {/* 2. التقويم وجدول الفترات والمواعيد كـ Server Component مع معالجة الأخطاء والتخزين المؤقت والـ Suspense */}
      <ErrorBoundary errorComponent={AppointmentsCalendarError}>
        <Suspense fallback={<AppointmentsCalendarSkeleton />}>
          <AppointmentsCalendarServer searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

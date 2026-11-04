'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AppointmentsCalendarData, CalendarViewMode } from '../types/calendar';
import { CalendarHeaderControls } from './calendar-header-controls';
import { CalendarSummaryCards } from './calendar-summary-cards';
import { CalendarDayTimelineView } from './calendar-day-timeline-view';
import { CalendarWeekGridView } from './calendar-week-grid-view';
import { CalendarMonthGridView } from './calendar-month-grid-view';

interface AppointmentsCalendarViewProps {
  data: AppointmentsCalendarData;
  initialView?: CalendarViewMode;
  initialDate?: string;
  initialDoctorId?: string;
}

export function AppointmentsCalendarView({
  data,
  initialView = 'list',
  initialDate,
  initialDoctorId,
}: AppointmentsCalendarViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentView: CalendarViewMode =
    (searchParams?.get('view') as CalendarViewMode) || initialView || 'list';
  const currentDate =
    searchParams?.get('date') || initialDate || data.date || new Date().toISOString().split('T')[0];
  const currentDoctorId =
    searchParams?.get('doctorId') !== null
      ? (searchParams?.get('doctorId') || '')
      : (initialDoctorId || data.doctorId || '');

  // تحديث مسار الـ URL بسلاسة
  const updateUrlParams = (updates: {
    date?: string;
    doctorId?: string;
    view?: CalendarViewMode;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (updates.date !== undefined) {
      if (updates.date) params.set('date', updates.date);
      else params.delete('date');
    }

    if (updates.doctorId !== undefined) {
      if (updates.doctorId) params.set('doctorId', updates.doctorId);
      else params.delete('doctorId');
    }

    if (updates.view !== undefined) {
      if (updates.view) params.set('view', updates.view);
      else params.delete('view');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleDateChange = (newDate: string) => {
    updateUrlParams({ date: newDate });
  };

  const handleDoctorChange = (doctorId: string) => {
    updateUrlParams({ doctorId });
  };

  const handleViewModeChange = (mode: CalendarViewMode) => {
    updateUrlParams({ view: mode });
  };

  const handleShiftWeek = (daysOffset: number) => {
    const currentAnchor = new Date((data.weekRange?.startDate || currentDate) + 'T12:00:00Z');
    currentAnchor.setUTCDate(currentAnchor.getUTCDate() + daysOffset);
    const newDateStr = currentAnchor.toISOString().split('T')[0];
    updateUrlParams({ date: newDateStr, view: 'week' });
  };

  const handleShiftMonth = (monthsOffset: number) => {
    const currentAnchor = new Date(currentDate + 'T12:00:00Z');
    currentAnchor.setUTCMonth(currentAnchor.getUTCMonth() + monthsOffset);
    const newDateStr = currentAnchor.toISOString().split('T')[0];
    updateUrlParams({ date: newDateStr, view: 'month' });
  };

  const handleSelectDay = (dateStr: string) => {
    updateUrlParams({ date: dateStr, view: 'list' });
  };

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* 1. عناصر التحكم العلوية (Header Controls) */}
      <CalendarHeaderControls
        currentDate={currentDate}
        onDateChange={handleDateChange}
        viewMode={currentView}
        onViewModeChange={handleViewModeChange}
        selectedDoctorId={currentDoctorId}
        onDoctorChange={handleDoctorChange}
        doctors={data.allDoctors || []}
        doctorName={data.doctor?.name}
        isDoctorView={data.isDoctorView}
        weekStartDate={data.weekRange?.startDate}
        weekEndDate={data.weekRange?.endDate}
        monthName={data.monthRange?.monthName}
        monthYear={data.monthRange?.year}
        onShiftWeek={handleShiftWeek}
        onShiftMonth={handleShiftMonth}
      />

      {/* 2. في وضع القائمة: نعرض بطاقات الإحصائيات الأربعة (KPIs) */}
      {currentView === 'list' && (
        <CalendarSummaryCards summary={data.summary} />
      )}

      {/* 3. عرض المواعيد بحسب النمط المختار (قائمة الفترات / أسبوع / شهر) */}
      {currentView === 'list' ? (
        <CalendarDayTimelineView
          slots={data.daySlots || []}
          selectedDate={currentDate}
          selectedDoctorId={currentDoctorId}
          isDoctorView={data.isDoctorView}
        />
      ) : currentView === 'week' ? (
        <CalendarWeekGridView
          days={data.weekRange?.days || []}
          appointments={data.weekAppointments || []}
          selectedDoctorId={currentDoctorId}
          isDoctorView={data.isDoctorView}
        />
      ) : (
        <CalendarMonthGridView
          days={data.monthRange?.days || []}
          appointments={data.monthAppointments || []}
          selectedDoctorId={currentDoctorId}
          isDoctorView={data.isDoctorView}
          onSelectDay={handleSelectDay}
        />
      )}
    </div>
  );
}

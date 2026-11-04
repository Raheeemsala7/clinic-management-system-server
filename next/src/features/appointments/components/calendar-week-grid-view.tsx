'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { WeekDayItem, WeekAppointmentItem } from '../types/calendar';

interface CalendarWeekGridViewProps {
  days: WeekDayItem[];
  appointments: WeekAppointmentItem[];
  selectedDoctorId?: string;
  isDoctorView?: boolean;
}

const HOURS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];

export function CalendarWeekGridView({
  days,
  appointments,
  selectedDoctorId,
  isDoctorView,
}: CalendarWeekGridViewProps) {
  const router = useRouter();

  // خريطة لتحديد المواعيد حسب اليوم والساعة
  const getApptsForCell = (dateStr: string, hourStr: string) => {
    const targetHour = parseInt(hourStr.split(':')[0], 10);
    return appointments.filter((a) => {
      if (a.clinicDate !== dateStr) return false;
      const apptHour = parseInt((a.startTime || '09:00').split(':')[0], 10);
      return apptHour === targetHour;
    });
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'FOLLOW_UP':
        return 'إعادة';
      case 'LAB_TESTS_IMAGING':
        return 'تحليل وأشعة';
      case 'TEST_RESULTS_REVIEW':
        return 'متابعة';
      case 'CONSULTATION':
        return 'استشارة';
      default:
        return 'كشف';
    }
  };

  return (
    <div className="space-y-4 select-none" dir="rtl">
      {/* 1. الشريط الفرعي التوضيحي ودليل الألوان (Legend) مع الإشارة للخط الأحمر مطابقة للصورة 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs px-1">
        {/* ملاحظة النقر */}
        <div className="text-slate-500 font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>
            {isDoctorView
              ? 'جدول مواعيدك الأسبوعية — اضغط على أي موعد لعرض تفاصيل المريض'
              : 'اضغط على أي فترة فارغة لحجز موعد جديد'}
          </span>
        </div>

        {/* دليل الألوان (Legend) */}
        <div className="flex items-center gap-4 font-bold text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span>مكتمل</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
            <span>في الانتظار</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0040D8]" />
            <span>محجوز</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-500">
            <span className="w-3 h-0.5 bg-rose-500 inline-block" />
            <span>الخط الأحمر = الوقت الحالي</span>
          </div>
        </div>
      </div>

      {/* 2. شبكة التقويم الأسبوعية (Weekly Grid) مطابقة للصورة 2 */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            {/* صف رؤوس الأيام (7 أعمدة للأيام + عمود الوقت على اليسار) */}
            <div className="grid grid-cols-8 border-b border-slate-200 text-center text-xs font-bold bg-slate-50/50">
              {/* رؤوس الأيام السبعة من السبت للجمعة (RTL) */}
              {days.map((day) => (
                <div
                  key={day.date}
                  className={`py-3.5 px-2 border-l border-slate-200 transition-colors ${
                    day.isToday
                      ? 'bg-[#0A164E] text-white shadow-sm'
                      : day.isOffDay
                      ? 'bg-slate-100/70 text-slate-400'
                      : 'text-slate-700'
                  }`}
                >
                  <div className="text-sm font-black">
                    {day.dayName} {day.dayNumber}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      day.isToday
                        ? 'text-yellow-400 font-black'
                        : day.isOffDay
                        ? 'text-slate-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.isToday ? 'اليوم' : day.isOffDay ? 'إجازة' : ''}
                  </div>
                </div>
              ))}

              {/* عمود الساعات في أقصى اليسار */}
              <div className="py-3.5 px-2 text-slate-400 font-mono text-center flex items-center justify-center">
                الوقت
              </div>
            </div>

            {/* صفوف الساعات */}
            <div className="divide-y divide-slate-100">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[85px] group">
                  {/* خلايا الأيام لهذا الوقت */}
                  {days.map((day) => {
                    const cellAppts = getApptsForCell(day.date, hour);
                    const isOff = day.isOffDay;

                    return (
                      <div
                        key={`${day.date}-${hour}`}
                        className={`p-1.5 border-l border-slate-100 relative transition-colors ${
                          isOff
                            ? 'bg-slate-50/50 cursor-not-allowed'
                            : isDoctorView
                            ? 'hover:bg-slate-50/60'
                            : 'hover:bg-blue-50/30 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isDoctorView && !isOff && cellAppts.length === 0) {
                            router.push(
                              `/dashboard/appointments/new?date=${day.date}&time=${hour}${
                                selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
                              }`
                            );
                          }
                        }}
                      >
                        {/* خط المؤشر الأحمر للوقت الحالي (على عمود اليوم الحالي) */}
                        {day.isToday && hour === '11:00' && (
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 z-10 shadow-xs pointer-events-none" />
                        )}

                        {/* بطاقات المواعيد المحجوزة في هذه الخلية */}
                        <div className="space-y-1.5">
                          {cellAppts.map((appt) => {
                            const isCompleted = appt.status === 'COMPLETED';
                            const isWaiting = appt.status === 'WAITING';

                            const cardStyle = isCompleted
                              ? 'bg-[#DCFCE7] border-[#86EFAC] text-emerald-900'
                              : isWaiting
                              ? 'bg-[#FEF08A] border-[#FDE047] text-amber-950'
                              : 'bg-[#DBEAFE] border-[#BFDBFE] text-blue-950';

                            return (
                              <Link
                                key={appt.id}
                                href={`/dashboard/appointments?date=${day.date}${
                                  selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
                                }`}
                                onClick={(e) => e.stopPropagation()}
                                className={`block p-2 rounded-xl border text-[11px] font-bold shadow-2xs hover:shadow-xs transition-all ${cardStyle}`}
                              >
                                {/* السطر الأول: الوقت ونوع الكشف */}
                                <div className="flex items-center justify-between font-mono text-[10px]">
                                  <span className="font-bold">{appt.startTime}</span>
                                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-md bg-white/80 font-black shadow-2xs">
                                    {getTypeLabel(appt.type)}
                                  </span>
                                </div>

                                {/* السطر الثاني: اسم المريض */}
                                <div className="mt-1 font-black truncate text-xs">
                                  {appt.patientName}
                                </div>

                                {/* السطر الثالث: اسم الطبيب (للريسبشن أو لتوضيح الطبيب المعالج) */}
                                {appt.doctorName && (
                                  <div className="mt-1 text-[10px] opacity-85 truncate flex items-center gap-1 font-bold border-t border-black/5 pt-1">
                                    <span className="text-[11px]">👨‍⚕️</span>
                                    <span>{appt.doctorName}</span>
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* عمود الساعة في اليسار */}
                  <div className="p-2 text-center text-xs font-mono text-slate-400 font-bold flex items-center justify-center">
                    {hour}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

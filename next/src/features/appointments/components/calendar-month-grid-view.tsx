'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { MonthDayItem, WeekAppointmentItem } from '../types/calendar';

interface CalendarMonthGridViewProps {
  days: MonthDayItem[];
  appointments: WeekAppointmentItem[];
  selectedDoctorId?: string;
  isDoctorView?: boolean;
  onSelectDay: (date: string) => void;
}

export function CalendarMonthGridView({
  days,
  appointments,
  selectedDoctorId,
  isDoctorView,
  onSelectDay,
}: CalendarMonthGridViewProps) {
  const router = useRouter();

  // تجميع مواعيد كل يوم
  const getApptsForDay = (dateStr: string) => {
    return appointments.filter((a) => a.clinicDate === dateStr);
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'FOLLOW_UP':
        return 'إعادة';
      case 'LAB_TESTS_IMAGING':
        return 'تحليل';
      case 'TEST_RESULTS_REVIEW':
        return 'متابعة';
      case 'CONSULTATION':
        return 'استشارة';
      default:
        return 'كشف';
    }
  };

  const ARABIC_DAYS_HEADER = [
    'السبت',
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
  ];

  return (
    <div className="space-y-4 select-none" dir="rtl">
      {/* 1. الشريط الفرعي ودليل الألوان (Legend) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs px-1">
        <div className="text-slate-500 font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>
            {isDoctorView
              ? 'تقويم الشهر — اضغط على أي يوم لعرض قائمة مواعيده بالتفصيل'
              : 'اضغط على أي يوم لاستعراض قائمة مواعيده أو النقر لإضافة حجز جديد'}
          </span>
        </div>

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
        </div>
      </div>

      {/* 2. شبكة الشهر (Month Calendar Grid) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            {/* صف رؤوس الأيام (7 أعمدة من السبت إلى الجمعة) */}
            <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-black bg-slate-50/70">
              {ARABIC_DAYS_HEADER.map((dayName, idx) => (
                <div
                  key={dayName}
                  className={`py-3.5 px-2 border-l border-slate-200 last:border-l-0 ${
                    idx === 6 ? 'bg-slate-100/60 text-slate-400' : 'text-slate-700'
                  }`}
                >
                  <span>{dayName}</span>
                  {idx === 6 && (
                    <span className="text-[10px] text-slate-400 font-normal mr-1">
                      (إجازة)
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* شبكة أيام الشهر (مقسمة إلى 7 أعمدة) */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dir-rtl">
              {days.map((day) => {
                const dayAppts = getApptsForDay(day.date);
                const isOff = day.isOffDay;
                const isCurrent = day.isCurrentMonth;
                const isToday = day.isToday;

                return (
                  <div
                    key={day.date}
                    onClick={() => onSelectDay(day.date)}
                    className={`min-h-[115px] p-2 border-l border-b border-slate-100 transition-colors flex flex-col justify-between cursor-pointer ${
                      !isCurrent
                        ? 'bg-slate-50/40 text-slate-300'
                        : isOff
                        ? 'bg-slate-50/60'
                        : isToday
                        ? 'bg-blue-50/20 hover:bg-blue-50/40'
                        : 'hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    {/* ترويسة اليوم: رقم اليوم والحالة */}
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
                          isToday
                            ? 'bg-[#0A164E] text-white shadow-xs'
                            : !isCurrent
                            ? 'text-slate-300'
                            : isOff
                            ? 'text-slate-400'
                            : 'text-[#0A164E]'
                        }`}
                      >
                        {day.dayNumber}
                      </div>

                      {/* شارة إجازة أو عدد المواعيد */}
                      {isOff ? (
                        <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-100">
                          إجازة
                        </span>
                      ) : dayAppts.length > 0 ? (
                        <span className="text-[10px] text-blue-700 font-bold px-1.5 py-0.2 rounded-md bg-blue-50 border border-blue-100">
                          {dayAppts.length} {dayAppts.length === 1 ? 'موعد' : 'مواعيد'}
                        </span>
                      ) : null}
                    </div>

                    {/* قائمة المواعيد في اليوم (عرض حتى 2 أو 3 مواعيد) */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {dayAppts.slice(0, 2).map((appt) => {
                        const isCompleted = appt.status === 'COMPLETED';
                        const isWaiting = appt.status === 'WAITING';

                        const pillColor = isCompleted
                          ? 'bg-[#DCFCE7] border-[#86EFAC] text-emerald-950'
                          : isWaiting
                          ? 'bg-[#FEF08A] border-[#FDE047] text-amber-950'
                          : 'bg-[#DBEAFE] border-[#BFDBFE] text-blue-950';

                        return (
                          <div
                            key={appt.id}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold truncate shadow-2xs ${pillColor}`}
                            title={`${appt.patientName} (${appt.startTime}) - ${appt.doctorName}`}
                          >
                            <div className="flex items-center justify-between font-mono text-[9px]">
                              <span>{appt.startTime}</span>
                              <span className="font-sans px-1 rounded bg-white/70">
                                {getTypeLabel(appt.type)}
                              </span>
                            </div>
                            <div className="font-black truncate mt-0.5">
                              {appt.patientName}
                            </div>
                            {appt.doctorName && (
                              <div className="opacity-80 text-[9px] truncate">
                                👨‍⚕️ {appt.doctorName}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {dayAppts.length > 2 && (
                        <div className="text-[10px] font-bold text-blue-600 text-center pt-0.5 hover:underline">
                          +{dayAppts.length - 2} مواعيد أخرى
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

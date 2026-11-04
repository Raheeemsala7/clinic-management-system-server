'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Check, AlertTriangle, Edit2, Plus, Stethoscope } from 'lucide-react';
import { DaySlotItem, DaySlotAppointment } from '../types/calendar';

interface CalendarDayTimelineViewProps {
  slots: DaySlotItem[];
  selectedDate: string;
  selectedDoctorId?: string;
  isDoctorView?: boolean;
}

export function CalendarDayTimelineView({
  slots,
  selectedDate,
  selectedDoctorId,
  isDoctorView,
}: CalendarDayTimelineViewProps) {
  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'FOLLOW_UP':
        return 'إعادة';
      case 'LAB_TESTS_IMAGING':
        return 'تحليل وأشعة';
      case 'TEST_RESULTS_REVIEW':
        return 'مراجعة فحوصات';
      case 'CONSULTATION':
        return 'استشارة';
      default:
        return 'كشف';
    }
  };

  const renderAppointmentCard = (appt: DaySlotAppointment, slotTime: string, totalInSlot: number) => {
    const isCompleted = appt.status === 'COMPLETED';
    const isWaiting = appt.status === 'WAITING';
    const isBookedStatus = appt.status === 'BOOKED';

    const indicatorColor = isCompleted
      ? 'bg-[#16A34A]'
      : isWaiting
      ? 'bg-[#EAB308]'
      : 'bg-[#0040D8]';

    return (
      <div
        key={appt.id}
        className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        {/* شريط الإشارة الملون في اليمين */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-2 ${indicatorColor}`}
        />

        {/* الجانب الأيمن: وقت الحجز + بيانات المريض واسم الطبيب */}
        <div className="flex items-center gap-5 pr-2 flex-1">
          {/* الوقت */}
          <div className="text-center shrink-0 min-w-[70px]">
            <div className="text-base sm:text-lg font-black text-[#0A164E] font-mono">
              {slotTime}
            </div>
            <div className="text-[11px] text-slate-400 font-bold mt-0.5">
              {totalInSlot > 1 ? `${totalInSlot} مرضى` : '1 مريض محجوز'}
            </div>
          </div>

          {/* تفاصيل المريض والطبيب */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-black text-[#0A164E]">
                {appt.patientName}
              </h4>
              {appt.queueNumber > 0 && (
                <span className="px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-bold">
                  #{appt.queueNumber}
                </span>
              )}

              {/* شارة اسم الطبيب المعالج */}
              {appt.doctorName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0040D8]" />
                  <span>{appt.doctorName}</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-400 font-sans flex items-center gap-2">
              {appt.patientPhone && (
                <span className="font-mono text-slate-500">{appt.patientPhone}</span>
              )}
              {appt.notes && (
                <span className="text-slate-400 truncate max-w-xs">
                  · {appt.notes}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* الجانب الأوسط والأيسر: الشارات والإجراءات */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* شارة نوع الكشف */}
          <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#0040D8] text-xs font-bold border border-blue-100">
            {getTypeLabel(appt.type)}
          </span>

          {/* شارة الموقف المالي */}
          {appt.isFullyPaid ? (
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>مدفوع بالكامل ({appt.totalAmount} ج.م)</span>
            </span>
          ) : appt.hasRemaining ? (
            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>
                عربون {appt.paidAmount} ج.م · متبقي {appt.remainingAmount}
              </span>
            </span>
          ) : appt.isExempt ? (
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
              معفي من الرسوم
            </span>
          ) : null}

          {/* شارة حالة الموعد */}
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold ${
              isCompleted
                ? 'bg-[#16A34A] text-white shadow-2xs'
                : isWaiting
                ? 'bg-[#EAB308] text-white shadow-2xs'
                : isBookedStatus
                ? 'bg-[#0040D8] text-white shadow-2xs'
                : 'bg-slate-600 text-white'
            }`}
          >
            {isCompleted
              ? 'مكتمل'
              : isWaiting
              ? 'في الانتظار'
              : isBookedStatus
              ? 'محجوز'
              : appt.status}
          </span>

          {/* زر التعديل أو فتح ملف المريض */}
          <Link
            href={`/dashboard/patients/${appt.patientId}`}
            title="فتح ملف المريض"
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 select-none" dir="rtl">
      {/* الشريط الفرعي التوضيحي مع مفتاح الألوان (Legend) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-bold px-1">
        {/* عنوان الجدول وتاريخه */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>جدول الفترات المتاحة والمحجوزة ({selectedDate})</span>
        </div>

        {/* دليل الألوان (Legend) مطابقة للصورة */}
        <div className="flex items-center gap-4 text-xs font-bold">
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

      {/* قائمة الفترات الزمنية لليوم */}
      <div className="space-y-3">
        {slots.map((slot) => {
          const appts = slot.appointments && slot.appointments.length > 0
            ? slot.appointments
            : slot.appointment
            ? [slot.appointment]
            : [];

          if (slot.isBooked && appts.length > 0) {
            return (
              <div key={slot.time} className="space-y-2.5">
                {appts.map((appt) =>
                  renderAppointmentCard(appt, slot.time, appts.length)
                )}
              </div>
            );
          }

          // فترة شاغرة متاحة للحجز (تظهر للاستقبال أو الطبيب)
          return (
            <div
              key={slot.time}
              className="bg-white/80 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-300 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all group"
            >
              {/* وقت الفترة */}
              <div className="text-base sm:text-lg font-black text-slate-400 font-mono min-w-[70px] text-center">
                {slot.time}
              </div>

              {/* نص توضيحي */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>فترة شاغرة — متاحة للحجز</span>
              </div>

              {/* زر حجز هذه الفترة (يظهر لموظف الاستقبال) */}
              {!isDoctorView ? (
                <Link
                  href={`/dashboard/appointments/new?date=${selectedDate}&time=${slot.time}${
                    selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''
                  }`}
                  className="h-9 px-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/80 text-[#0040D8] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>حجز هذه الفترة</span>
                </Link>
              ) : (
                <span className="text-xs text-slate-400 font-bold px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/60">
                  متاحة
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

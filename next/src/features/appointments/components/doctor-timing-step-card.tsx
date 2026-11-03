'use client';

import React, { useEffect } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { BookingFormType } from '../types/booking';
import { SAMPLE_DOCTORS, SAMPLE_SLOTS } from '../constants/booking.constant';
import { useDoctorsQuery, useDoctorAvailableSlotsQuery } from '../hooks/appointments.hook';
import { Calendar, ChevronDown, AlertCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * القسم 3: الطبيب والتوقيت
 * - تحديد الطبيب المعالج، وتاريخ الموعد، ونوع الحضور
 * - اختيار وقت الموعد مباشرة من شبكة المواعيد المتاحة
 * - زر «الآن» للحضور المباشر الفوري بالوقت الحالي
 */
export function DoctorTimingStepCard() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormType>();

  const doctorId = useWatch({ control, name: 'doctorId' });
  const appointmentDate = useWatch({ control, name: 'appointmentDate' });
  const selectedTime = useWatch({ control, name: 'appointmentTime' });
  const source = useWatch({ control, name: 'source' });

  // 1. استعلام الأطباء وتخزينهم في الـ Cache
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctorsQuery();
  const doctorsList = doctorsData && doctorsData.length > 0 ? doctorsData : SAMPLE_DOCTORS;

  // تعيين أول طبيب تلقائياً إذا كان الحقل فارغاً أو غير موجود في القائمة
  useEffect(() => {
    if (doctorsList.length > 0) {
      const exists = doctorsList.some((d) => d.id === doctorId);
      if (!doctorId || !exists) {
        setValue('doctorId', doctorsList[0].id, {
          shouldValidate: true,
          shouldDirty: false,
        });
      }
    }
  }, [doctorsList, doctorId, setValue]);

  // 2. استعلام المواعيد المتاحة للطبيب واليوم المختار
  const effectiveDoctorId = doctorId || doctorsList[0]?.id;
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    isFetching: isFetchingSlots,
  } = useDoctorAvailableSlotsQuery(effectiveDoctorId, appointmentDate);

  // تعيين الحضور المباشر الآن بالوقت الحالي الفعلي
  const handleSelectNow = () => {
    setValue('source', 'WALK_IN', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const isPm = hours >= 12;
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    const formattedTime = `${displayHours}:${minutes} ${isPm ? 'م' : 'ص'}`;

    setValue('appointmentTime', formattedTime, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  // تعيين فترة زمنية محددة عند الضغط على وقت متاح
  const handleSelectSlot = (slotLabel: string) => {
    setValue('appointmentTime', slotLabel, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('source', 'SCHEDULED', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  // قائمة المواعيد المعروضة: المتاحة والمحجوزة فقط
  const hasApiSlots = Boolean(slotsData && Array.isArray(slotsData.slots));
  const rawSlots = hasApiSlots ? slotsData!.slots : SAMPLE_SLOTS;

  const displayableSlots = rawSlots.filter((slot: any) => {
    return Boolean(slot.isAvailable || slot.isBooked);
  });

  // حماية ذكية: إذا تغير اليوم أو الطبيب في وضع الحجز المسبق، نتحقق أن الوقت المختار ما زال متاحاً في اليوم الجديد
  useEffect(() => {
    if (source === 'SCHEDULED' && displayableSlots.length > 0) {
      const isCurrentTimeAvailable = displayableSlots.some(
        (s: any) => s.isAvailable && (s.label === selectedTime || s.startTime === selectedTime)
      );
      if (!isCurrentTimeAvailable) {
        const firstAvailable = displayableSlots.find((s: any) => s.isAvailable);
        if (firstAvailable) {
          const slotLabel = (firstAvailable as any).label || (firstAvailable as any).startTime || (firstAvailable as any).time;
          setValue('appointmentTime', slotLabel, {
            shouldValidate: true,
            shouldDirty: true,
          });
        } else {
          setValue('appointmentTime', '', {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    }
  }, [displayableSlots, source, selectedTime, setValue]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 space-y-6 animate-in fade-in-50">
      {/* رأس القسم: الرقم 3 والعنوان */}
      <div className="flex items-start gap-3.5">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-black text-sm shrink-0">
          3
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#0A164E] tracking-tight">
            الطبيب والتوقيت
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            حدد الطبيب والتاريخ والساعة ونوع الحضور
          </p>
        </div>
      </div>

      {/* عناصر التحكم الرئيسية في 4 حقول متناسقة مطابقة للتصميم: الطبيب المعالج + تاريخ الموعد + ساعة الموعد + نوع الحضور */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
        {/* 1. الطبيب المعالج */}
        <div>
          <label className="block text-xs font-bold text-[#0A164E] mb-1.5">
            الطبيب المعالج <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="doctorId"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <select
                  value={field.value || ''}
                  onChange={field.onChange}
                  disabled={isLoadingDoctors}
                  className={cn(
                    'w-full h-11 pr-3.5 pl-9 rounded-2xl border bg-white text-xs font-bold text-[#0A164E] focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer disabled:opacity-60',
                    errors.doctorId ? 'border-rose-400' : 'border-slate-200'
                  )}
                >
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          />
          {errors.doctorId && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.doctorId.message}</span>
            </p>
          )}
        </div>

        {/* 2. تاريخ الموعد */}
        <div>
          <label className="block text-xs font-bold text-[#0A164E] mb-1.5">
            تاريخ الموعد <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="appointmentDate"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <input
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  className={cn(
                    'w-full h-11 pr-10 pl-3.5 rounded-2xl border bg-white text-xs font-bold text-[#0A164E] focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer',
                    errors.appointmentDate ? 'border-rose-400' : 'border-slate-200'
                  )}
                />
                <Calendar className="w-4 h-4 text-[#1D4ED8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          />
          {errors.appointmentDate && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.appointmentDate.message}</span>
            </p>
          )}
        </div>

        {/* 3. ساعة الموعد (عرض ذكي بالقراءة فقط لاختيار الوقت من المواعيد المتاحة) */}
        <div>
          <label className="block text-xs font-bold text-[#0A164E] mb-1.5">
            ساعة الموعد <span className="text-rose-500">*</span>
          </label>
          <div
            className={cn(
              'w-full h-11 px-3.5 rounded-2xl border bg-white flex items-center justify-between text-xs font-bold transition-all select-none',
              errors.appointmentTime ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
            )}
          >
            <span className={cn(selectedTime ? 'text-[#0A164E]' : 'text-slate-400 font-normal')}>
              {selectedTime || 'اختر من المواعيد'}
            </span>
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {errors.appointmentTime && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.appointmentTime.message}</span>
            </p>
          )}
        </div>

        {/* 4. نوع الحضور */}
        <div>
          <label className="block text-xs font-bold text-[#0A164E] mb-1.5">
            نوع الحضور <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-1 p-1 h-11 rounded-2xl border border-slate-200 bg-slate-50/70 items-center">
                <button
                  type="button"
                  onClick={() => {
                    field.onChange('WALK_IN');
                    handleSelectNow();
                  }}
                  className={cn(
                    'h-full rounded-xl text-[11px] font-black transition-all cursor-pointer flex flex-col items-center justify-center leading-tight py-0.5 select-none',
                    field.value === 'WALK_IN'
                      ? 'bg-[#0040D8] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <span>بدون موعد</span>
                  <span className="text-[9px] opacity-90">(مباشر)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    field.onChange('SCHEDULED');
                    // إذا لم يكن هناك موعد مسبق مختار، نحدد أول موعد متاح
                    const firstAvailable = displayableSlots.find((s: any) => s.isAvailable);
                    if (firstAvailable) {
                      const slotLabel = (firstAvailable as any).label || (firstAvailable as any).startTime || (firstAvailable as any).time;
                      handleSelectSlot(slotLabel);
                    }
                  }}
                  className={cn(
                    'h-full rounded-xl text-[11px] font-black transition-all cursor-pointer flex flex-col items-center justify-center leading-tight py-0.5 select-none',
                    field.value === 'SCHEDULED'
                      ? 'bg-[#0040D8] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <span>موعد</span>
                  <span className="text-[9px] opacity-90">مسبق</span>
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* قسم المواعيد المتاحة واختيار الوقت */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-black text-[#0A164E]">
              المواعيد المتاحة اليوم
            </h4>
            {selectedTime && (
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-[#0040D8] text-[11px] font-black">
                الوقت المختار: {selectedTime}
              </span>
            )}
            {isFetchingSlots && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D4ED8]" />
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            المشطوبة محجوزة • «الآن» للحضور المباشر
          </span>
        </div>

        {/* حالة التحميل الأولي للمواعيد */}
        {isLoadingSlots ? (
          <div className="flex items-center gap-2 py-4 text-xs font-bold text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#1D4ED8]" />
            <span>جاري فحص المواعيد المتاحة للطبيب...</span>
          </div>
        ) : slotsData && !slotsData.isWorkingDay ? (
          /* حالة يوم عطلة أو غير متاح */
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {slotsData.message || 'عطلة أسبوعية · لا توجد فترات عمل متاحة لهذا الطبيب في هذا اليوم'}
            </span>
          </div>
        ) : slotsData && slotsData.isPast ? (
          /* حالة تاريخ في الماضي */
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2 animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {slotsData.message || 'التاريخ المحدد في الماضي · لا يمكن حجز مواعيد سابقة'}
            </span>
          </div>
        ) : displayableSlots.length === 0 ? (
          /* حالة عدم وجود مواعيد متاحة أو محجوزة */
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold text-center">
            لا توجد مواعيد متاحة أو محجوزة متبقية لهذا اليوم.
          </div>
        ) : (
          /* شبكة أزرار الفترات الزمنية المتاحة لاختيار الوقت */
          <div className="flex flex-wrap items-center gap-2">
            {/* زر «الآن» الأصفر المميز */}
            <button
              type="button"
              onClick={handleSelectNow}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs bg-brand-yellow text-slate-950 hover:brightness-95 active:scale-98 select-none',
                source === 'WALK_IN' && 'ring-2 ring-amber-500 ring-offset-1'
              )}
            >
              الآن
            </button>

            {/* أزرار الساعات */}
            {displayableSlots.map((slot: any, idx: number) => {
              const label = slot.label || slot.startTime || `slot-${idx}`;
              const isAvailable = Boolean(slot.isAvailable);
              const isSelected = selectedTime === label;

              // موعد محجوز (مشطوب وغير قابل للاختيار)
              if (slot.isBooked || !isAvailable) {
                return (
                  <button
                    key={slot.time || slot.startTime || idx}
                    type="button"
                    disabled
                    title="موعد محجوز"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-300 border border-slate-200 line-through cursor-not-allowed select-none"
                  >
                    {label}
                  </button>
                );
              }

              // موعد متاح (قابل للاختيار بالضغط عليه)
              return (
                <button
                  key={slot.time || slot.startTime || idx}
                  type="button"
                  onClick={() => handleSelectSlot(label)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none',
                    isSelected
                      ? 'bg-[#0040D8] text-white border-[#0040D8] shadow-xs font-black ring-2 ring-blue-600/10'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* تنبيه الخطأ في حال عدم اختيار وقت موعد */}
        {errors.appointmentTime && (
          <p className="text-xs text-rose-500 font-bold flex items-center gap-1 pt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.appointmentTime.message}</span>
          </p>
        )}
      </div>
    </div>
  );
}

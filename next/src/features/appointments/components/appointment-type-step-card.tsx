'use client';

import React from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { BookingFormType } from '../types/booking';
import { APPOINTMENT_TYPES } from '../constants/booking.constant';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * القسم 2: نوع الموعد
 * - بطاقات لاختيار نوع الحجز (كشف، إعادة، متابعة عملية، تحليل وأشعة، مراجعة فحوصات)
 * - تحديث سعر الكشف تلقائياً في النموذج وملخص الحجز
 */
export function AppointmentTypeStepCard() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormType>();

  const selectedType = useWatch({ control, name: 'appointmentType' });
  const isExempt = useWatch({ control, name: 'isExempt' });

  const handleSelectType = (typeId: BookingFormType['appointmentType'], defaultFee: number) => {
    setValue('appointmentType', typeId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // تحديث سعر الكشف تلقائياً بحسب نوع الحجز إذا لم يكن معفى
    if (!isExempt) {
      setValue('examinationFee', defaultFee, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 space-y-5 animate-in fade-in-50">
      {/* رأس القسم: الرقم 2 والعنوان */}
      <div className="flex items-start gap-3.5">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-black text-sm shrink-0">
          2
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#0A164E] tracking-tight">
            نوع الموعد
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            اختر نوع الحجز
          </p>
        </div>
      </div>

      {/* شبكة خيارات أنواع المواعيد */}
      <Controller
        name="appointmentType"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {APPOINTMENT_TYPES.map((type) => {
                const isSelected = field.value === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelectType(type.id, type.defaultFee)}
                    className={cn(
                      'h-12 sm:h-14 px-3 py-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 select-none',
                      isSelected
                        ? 'border-[#1D4ED8] bg-blue-50/70 text-[#0A164E] font-black shadow-xs ring-2 ring-blue-600/10'
                        : 'border-slate-200 bg-white text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50/60'
                    )}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#1D4ED8] stroke-[3] shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm">{type.label}</span>
                    <span
                      className={cn('w-2 h-2 rounded-full shrink-0', type.dotColor)}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            {errors.appointmentType && (
              <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.appointmentType.message}</span>
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
}


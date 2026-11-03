'use client';

import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BookingFormType } from '../types/booking';
import { APPOINTMENT_TYPES, CHRONIC_DISEASES, SAMPLE_DOCTORS } from '../constants/booking.constant';
import { useDoctorsQuery } from '../hooks/appointments.hook';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingSummaryPanelProps {
  isSubmitting?: boolean;
  onCancel?: () => void;
}

/**
 * لوحة ملخص الحجز - كارت جانبي ثابت على الشاشات الكبيرة، وشريط ملخص سفلي على الموبايل
 * ترتبط لحظياً بجميع قيم النموذج عبر useWatch لتحديث البيانات فور حدوث أي تغيير
 */
export function BookingSummaryPanel({ isSubmitting = false, onCancel }: BookingSummaryPanelProps) {
  const { control } = useFormContext<BookingFormType>();

  // استخدام useWatch لضمان الاشتراك اللحظي وإعادة التصيير الفوري عند تغيير أي حقل
  const patientName = useWatch({ control, name: 'patientName' });
  const doctorId = useWatch({ control, name: 'doctorId' });
  const appointmentType = useWatch({ control, name: 'appointmentType' });
  const appointmentDate = useWatch({ control, name: 'appointmentDate' });
  const appointmentTime = useWatch({ control, name: 'appointmentTime' });
  const source = useWatch({ control, name: 'source' });
  const hasChronicDisease = useWatch({ control, name: 'hasChronicDisease' });
  const chronicDiseases = useWatch({ control, name: 'chronicDiseases' }) || [];
  const examinationFee = useWatch({ control, name: 'examinationFee' }) || 0;
  const paidAmount = useWatch({ control, name: 'paidAmount' }) || 0;
  const isExempt = useWatch({ control, name: 'isExempt' });
  const exemptionReason = useWatch({ control, name: 'exemptionReason' });

  // جلب بيانات الأطباء من الكاش
  const { data: doctorsData } = useDoctorsQuery();
  const doctorsList = doctorsData && doctorsData.length > 0 ? doctorsData : SAMPLE_DOCTORS;
  const currentDoctor = doctorsList.find((d) => d.id === doctorId) || doctorsList[0];

  // إيجاد مسمى نوع الموعد
  const currentType = APPOINTMENT_TYPES.find((t) => t.id === appointmentType) || APPOINTMENT_TYPES[0];

  // إيجاد أسماء الأمراض المزمنة المحددة
  const selectedDiseasesLabels = chronicDiseases
    .map((id) => CHRONIC_DISEASES.find((d) => d.id === id)?.label)
    .filter(Boolean)
    .join('، ');

  // حساب المتبقي المالي
  const finalFee = isExempt ? 0 : examinationFee;
  const remainingAmount = Math.max(0, finalFee - paidAmount);

  return (
    <>
      {/* 1. الكارت الجانبي للشاشات الكبيرة (Desktop Sticky Sidebar) */}
      <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
        <div className="sticky top-20 bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden select-none">
          {/* رأس الملخص مع شعار العيادة المربّع */}
          <div className="bg-[#0A164E] text-white px-5 py-4 flex items-center justify-between">
            <h3 className="font-black text-base tracking-tight">ملخص الحجز</h3>
            {/* الشعار المربّع الملوّن */}
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5 shrink-0" aria-hidden="true">
              <span className="w-2 h-2 rounded-2xs bg-[#1D4ED8]" />
              <span className="w-2 h-2 rounded-2xs bg-white" />
              <span className="w-2 h-2 rounded-2xs bg-[#081544]" />
              <span className="w-2 h-2 rounded-2xs bg-brand-yellow" />
            </div>
          </div>

          {/* محتويات تفاصيل الحجز */}
          <div className="p-5 space-y-3.5 text-xs">
            {/* المريض */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">المريض</span>
              <span className="font-bold text-[#0A164E] truncate max-w-[150px]">
                {patientName ? patientName : '[اسم المريض]'}
              </span>
            </div>

            {/* نوع الموعد */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">النوع</span>
              <span className="font-bold text-[#0A164E]">{currentType.label}</span>
            </div>

            {/* الطبيب */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">الطبيب</span>
              <span className="font-bold text-[#0A164E]">
                {currentDoctor?.name || 'د. إسلام'}
              </span>
            </div>

            {/* التاريخ */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">التاريخ</span>
              <span className="font-bold text-[#0A164E] dir-ltr">{appointmentDate || '02/11/2026'}</span>
            </div>

            {/* الساعة */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">الساعة</span>
              <span className="font-bold text-[#0A164E]">{appointmentTime || '04:30 م'}</span>
            </div>

            {/* نوع الحضور */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">الحضور</span>
              <span className="font-bold text-[#0A164E]">
                {source === 'WALK_IN' ? 'بدون موعد (مباشر)' : 'موعد مسبق'}
              </span>
            </div>

            {/* تنبيه المرض المزمن إن وجد */}
            {hasChronicDisease && selectedDiseasesLabels ? (
              <div className="p-2.5 rounded-xl bg-[#FFFDF0] border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in-50">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">مرض مزمن: {selectedDiseasesLabels}</span>
              </div>
            ) : null}

            <hr className="border-slate-100 my-2" />

            {/* سعر الكشف */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">سعر الكشف</span>
              <span className={cn('font-black text-[#0A164E]', isExempt && 'line-through text-slate-300')}>
                {examinationFee} ج.م
              </span>
            </div>

            {/* المدفوع */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">المدفوع</span>
              <span className="font-black text-[#0A164E]">{paidAmount} ج.م</span>
            </div>

            {/* شارة الإعفاء من الرسوم إن وجدت */}
            {isExempt && (
              <div className="p-2.5 rounded-xl bg-[#FFFDF0] border border-amber-300 text-amber-900 text-[11px] font-bold text-center animate-in fade-in-50">
                معفى من الرسوم — {exemptionReason || 'حالة إنسانية / غير مقتدر'}
              </div>
            )}

            {/* المتبقي */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 font-bold">المتبقي</span>
              <span className="font-black text-sm text-[#0A164E]">{remainingAmount} ج.م</span>
            </div>

            {/* أزرار الإجراءات */}
            <div className="pt-3 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-98 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>تأكيد وحفظ الحجز</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. الشريط العائم السفلي على شاشات الموبايل (Mobile Sticky Bottom Bar) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-40 shadow-xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#0A164E] truncate">
            {patientName ? `${patientName} · ` : ''}{currentType.label} · {appointmentTime || '04:30 م'}
          </p>
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {isExempt ? 'معفى من الرسوم' : `المتبقي: ${remainingAmount} ج.م`}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2.5 px-5 rounded-xl bg-[#0040D8] hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? 'جاري الحفظ...' : 'تأكيد الحجز'}
        </button>
      </div>
    </>
  );
}

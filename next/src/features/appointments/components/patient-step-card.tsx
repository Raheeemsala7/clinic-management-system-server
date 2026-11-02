'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { BookingFormType, PatientBasic } from '../types/booking';
import { CHRONIC_DISEASES, SAMPLE_PATIENTS } from '../constants/booking.constant';
import { searchPatientsAction, createQuickPatientAction } from '../apis/patients.action';
import { Search, UserPlus, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSearchPatients } from '../hooks/appointments.hook';
import { useDebounce } from "use-debounce";
import { SearchPatientInput } from './search-patient-input';

/**
 * القسم 1: المريض والتاريخ المرضي
 * - بحث فوري مع Debounce وربط حقيقي بـ API السيرفر
 * - إضافة مريض جديد سريع
 * - تحديد الأمراض المزمنة وتحديث ملخص الحجز لحظياً
 */
export function PatientStepCard() {
  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<BookingFormType>();

  // استخدام useWatch لضمان التفاعل اللحظي الفوري
  const selectedPatientId = useWatch({ control, name: 'patientId' });
  const selectedPatientName = useWatch({ control, name: 'patientName' });
  const selectedPatientPhone = useWatch({ control, name: 'patientPhone' });
  const selectedPatientGender = useWatch({ control, name: 'patientGender' });
  const selectedPatientAge = useWatch({ control, name: 'patientAge' });
  const hasChronicDisease = useWatch({ control, name: 'hasChronicDisease' });
  const selectedDiseases = useWatch({ control, name: 'chronicDiseases' }) || [];

  // const [searchQuery, setSearchQuery] = useState('');
  // const [searchResults, setSearchResults] = useState<PatientBasic[]>([]);
  // const [isSearching, setIsSearching] = useState(false);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickGender, setQuickGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [quickAge, setQuickAge] = useState<string>('');
  const [quickChronicConditions, setQuickChronicConditions] = useState<string[]>([]);
  const [quickError, setQuickError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedSearchQuery] = useDebounce(
    searchQuery.trim(),
    300,
  );





  // 2. اختيار مريض من نتائج البحث وتحديث النموذج وملخص الحجز فوراً
  const handleSelectPatient = (patient: PatientBasic) => {
    setValue('patientId', patient.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientName', patient.fullName || patient.name || '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientPhone', patient.phone, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    if (patient.gender) {
      setValue('patientGender', patient.gender, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    if (patient.age !== undefined && patient.age !== null) {
      setValue('patientAge', patient.age, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    if (patient.chronicConditions && patient.chronicConditions.length > 0) {
      setValue('hasChronicDisease', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue('chronicDiseases', patient.chronicConditions, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  };

  // 3. تسجيل مريض جديد عبر السيرفر واختياره مباشرة
  const handleQuickAdd = async () => {
    setQuickError(null);
    const trimmedName = quickName.trim();
    const trimmedPhone = quickPhone.trim();
    const parsedAge = quickAge.trim() ? Number(quickAge.trim()) : undefined;

    // التحقق من الاسم رباعي (4 مقاطع على الأقل)
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    if (!trimmedName || nameParts.length < 4) {
      setQuickError('يجب إدخال اسم المريض رباعياً على الأقل (أربعة مقاطع)');
      return;
    }

    // التحقق من رقم الهاتف
    if (!trimmedPhone) {
      setQuickError('يرجى إدخال رقم الهاتف');
      return;
    }

    // التحقق من صحة السن إن وُجد
    if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130)) {
      setQuickError('يرجى إدخال سن صحيح بين 0 و 130 سنة');
      return;
    }

    const chronicList = quickChronicConditions.length > 0
      ? quickChronicConditions
      : (hasChronicDisease && selectedDiseases.length > 0 ? selectedDiseases : []);

    setIsCreatingPatient(true);
  
  };

  // 4. مسح المريض المختار لإعادة البحث
  const handleClearPatient = () => {
    setValue('patientId', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientName', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientPhone', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientGender', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('patientAge', undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // 5. تبديل اختيار مرض مزمن
  const handleToggleDisease = (diseaseId: string) => {
    const updated = selectedDiseases.includes(diseaseId)
      ? selectedDiseases.filter((id) => id !== diseaseId)
      : [...selectedDiseases, diseaseId];
    setValue('chronicDiseases', updated, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 space-y-6">
      {/* حقول مخفية مسجلة في النموذج لضمان التوافق التام مع react-hook-form */}
      <input type="hidden" {...register('patientId')} />
      <input type="hidden" {...register('patientName')} />
      <input type="hidden" {...register('patientPhone')} />
      <input type="hidden" {...register('patientGender')} />
      <input type="hidden" {...register('patientAge')} />

      {/* رأس القسم: الرقم 1 والعنوان */}
      <div className="flex items-start gap-3.5">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-black text-sm shrink-0">
          1
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#0A164E] tracking-tight">
            المريض والتاريخ المرضي
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ابحث عن مريض مسجل أو سجل مريضاً جديداً
          </p>
        </div>
      </div>

      {/* نموذج البحث أو إضافة مريض جديد عند عدم اختيار مريض */}
      {!selectedPatientId ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* شريط البحث المباشر مع Debounce ومؤشر التحميل */}
            <SearchPatientInput />
            {/* زر تسجيل مريض جديد */}
            <button
              type="button"
              onClick={() => {
                setIsQuickAddOpen((prev) => !prev);
                setQuickError(null);
              }}
              className="h-11 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4 text-[#1D4ED8]" />
              <span>{isQuickAddOpen ? 'إلغاء' : '+ مريض جديد'}</span>
            </button>
          </div>

          {/* نموذج الإضافة السريعة لمريض جديد شامل: الاسم، النوع، السن، ورقم الهاتف */}
          {isQuickAddOpen && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-[#0A164E] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#1D4ED8]" />
                  <span>تسجيل مريض جديد فوري</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    setQuickError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              {/* تنبيه الخطأ إن وُجد */}
              {quickError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{quickError}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* 1. اسم المريض رباعياً */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المريض رباعياً <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => {
                      setQuickName(e.target.value);
                      if (quickError) setQuickError(null);
                    }}
                    placeholder="مثال: أحمد محمد علي حسن"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">يجب إدخال أربعة مقاطع للاسم على الأقل</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 2. رقم الهاتف */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={quickPhone}
                      onChange={(e) => {
                        setQuickPhone(e.target.value);
                        if (quickError) setQuickError(null);
                      }}
                      placeholder="01012345678"
                      dir="ltr"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/10 transition-all text-start"
                    />
                  </div>

                  {/* 3. السن */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      السن (بالسنوات) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={quickAge}
                      onChange={(e) => {
                        setQuickAge(e.target.value);
                        if (quickError) setQuickError(null);
                      }}
                      placeholder="مثال: 32"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                </div>

                {/* 4. النوع (ذكر / أنثى) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    النوع <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuickGender('MALE')}
                      className={cn(
                        'h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer',
                        quickGender === 'MALE'
                          ? 'bg-[#0A164E] text-white border-[#0A164E] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>ذكر</span>
                      {quickGender === 'MALE' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickGender('FEMALE')}
                      className={cn(
                        'h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer',
                        quickGender === 'FEMALE'
                          ? 'bg-[#0A164E] text-white border-[#0A164E] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                      <span>أنثى</span>
                      {quickGender === 'FEMALE' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* قسم التاريخ المرضي والأمراض المزمنة (مربع بلون أصفر فاتح مطابق للصورة) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF0] border border-amber-300 space-y-4">
                  {/* السؤال وزر التبديل (نعم / لا) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="font-bold text-xs sm:text-sm text-slate-800">
                      هل يعاني المريض من مرض مزمن؟ <span className="text-amber-600">*</span>
                    </span>

                    <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setValue('hasChronicDisease', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                        className={cn(
                          'px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                          hasChronicDisease
                            ? 'bg-[#0A164E] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        )}
                      >
                        نعم
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setValue('hasChronicDisease', false, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                          setValue('chronicDiseases', [], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                          setValue('chronicNotes', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        }}
                        className={cn(
                          'px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                          !hasChronicDisease
                            ? 'bg-[#0A164E] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        )}
                      >
                        لا
                      </button>
                    </div>
                  </div>

                  {/* قائمة شرائح الأمراض المزمنة عند اختيار "نعم" */}
                  {hasChronicDisease && (
                    <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in-50">
                      <div className="flex flex-wrap gap-2">
                        {CHRONIC_DISEASES.map((disease) => {
                          const isSelected = selectedDiseases.includes(disease.id);
                          return (
                            <button
                              key={disease.id}
                              type="button"
                              onClick={() => handleToggleDisease(disease.id)}
                              className={cn(
                                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                                isSelected
                                  ? 'bg-brand-yellow text-slate-950 font-black shadow-xs ring-1 ring-amber-400'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300'
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              <span>{disease.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* تفاصيل أو أدوية يتناولها المريض */}
                      <Controller
                        name="chronicNotes"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="text"
                            placeholder="تفاصيل أو أدوية يتناولها المريض (اختياري)..."
                            className="w-full h-10 px-3.5 rounded-xl border border-amber-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-200/30 transition-all"
                            {...field}
                          />
                        )}
                      />

                      {errors.chronicDiseases && (
                        <p className="text-xs text-rose-500 font-semibold">{errors.chronicDiseases.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* أزرار الإجراء */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={!quickName.trim() || !quickPhone.trim() || isCreatingPatient}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-xs"
                >
                  {isCreatingPatient ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري حفظ المريض...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>حفظ واختيار المريض</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    setQuickError(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {errors.patientId && (
            <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.patientId.message}</span>
            </p>
          )}
        </div>
      ) : (
        /* كارت المريض المختار المطابق تماماً للصورة 1 و 2 */
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A164E] text-white flex items-center justify-center font-black text-sm shrink-0">
              {selectedPatientName ? selectedPatientName.charAt(0) : 'م'}
            </div>
            <div>
              <p className="font-black text-sm text-[#0A164E]">{selectedPatientName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedPatientPhone ? `${selectedPatientPhone} · ` : ''}
                {selectedPatientAge ? `السن: ${selectedPatientAge} سنة · ` : ''}
                {selectedPatientGender
                  ? selectedPatientGender === 'FEMALE' || selectedPatientGender === 'female'
                    ? 'أنثى · '
                    : 'ذكر · '
                  : ''}
                سجل مريض معتمد
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearPatient}
            className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer"
          >
            تغيير
          </button>
        </div>
      )}


    </div>
  );
}

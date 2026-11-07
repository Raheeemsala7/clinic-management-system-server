'use client';

import React from 'react';
import {
  Pill,
  Printer,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Save,
  AlertCircle,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import {
  PrescriptionMedicine,
  EntExaminationData,
} from '../types/ent-examination.types';

interface PrescriptionViewProps {
  examData: EntExaminationData;
  patient: any;
  doctor?: any;
  onChange: (updater: (prev: EntExaminationData) => EntExaminationData) => void;
  onBackToExam: () => void;
  onSave: () => void;
  onFinish: () => void;
  onPrintRx: () => void;
  isSaving: boolean;
  isFinishing: boolean;
}

const QUICK_ENT_DRUGS: Array<Omit<PrescriptionMedicine, 'id'>> = [
  { drugName: 'Augmentin 1gm tab', dose: '1 قرص', frequency: 'كل 12 ساعة', duration: '7 أيام', instructions: 'بعد الأكل مباشرة' },
  { drugName: 'Curam 1gm tab', dose: '1 قرص', frequency: 'كل 12 ساعة', duration: '7 أيام', instructions: 'وسط الأكل' },
  { drugName: 'Otrivin Adult Nasal Spray', dose: 'بخة بكل فتحة أنف', frequency: 'مرتين يومياً', duration: '5 أيام', instructions: 'لا يُستخدم أكثر من 5 أيام لتجنب احتقان ارتدادي' },
  { drugName: 'Zyrtec 10mg tab (Cetirizine)', dose: '1 قرص', frequency: 'مساءً قبل النوم', duration: '10 أيام', instructions: 'قد يسبب بعض النعاس' },
  { drugName: 'Cataflam 50mg tab', dose: '1 قرص', frequency: 'عند اللزوم بعد الأكل', duration: '5 أيام', instructions: 'مسكن ومضاد للالتهاب' },
  { drugName: 'Otocort Ear Drops', dose: '3 نقط في الأذن', frequency: '3 مرات يومياً', duration: '7 أيام', instructions: 'تدفئة الزجاجة بوضعها في راحة اليد أولاً' },
  { drugName: 'Bbc Mouth Spray', dose: 'بختين في الحلق', frequency: '3 مرات يومياً', duration: '5 أيام', instructions: 'مطهر ومسكن موضعي' },
  { drugName: 'Flixonase Nasal Spray', dose: 'بخة بكل فتحة أنف', frequency: 'مرة واحدة صباحاً', duration: 'شهر', instructions: 'رج الزجاجة جيداً قبل الاستخدام' },
  { drugName: 'Alpha Chymotrypsin Amp', dose: 'حقنة عضل', frequency: 'يومياً', duration: '5 أيام', instructions: 'مضاد للارتشاح والتورم' },
];

export function PrescriptionView({
  examData,
  patient,
  doctor,
  onChange,
  onBackToExam,
  onSave,
  onFinish,
  onPrintRx,
  isSaving,
  isFinishing,
}: PrescriptionViewProps) {
  const items = examData.prescriptionItems || [];

  const addItem = () => {
    const newItem: PrescriptionMedicine = {
      id: Math.random().toString(36).substring(2, 9),
      drugName: '',
      dose: '',
      frequency: '',
      duration: '',
      instructions: '',
    };
    onChange((prev) => ({
      ...prev,
      prescriptionItems: [...(prev.prescriptionItems || []), newItem],
    }));
  };

  const updateItem = (id: string, field: keyof PrescriptionMedicine, value: string) => {
    onChange((prev) => ({
      ...prev,
      prescriptionItems: (prev.prescriptionItems || []).map((it) =>
        it.id === id ? { ...it, [field]: value } : it
      ),
    }));
  };

  const removeItem = (id: string) => {
    onChange((prev) => ({
      ...prev,
      prescriptionItems: (prev.prescriptionItems || []).filter((it) => it.id !== id),
    }));
  };

  const addQuickDrug = (drug: Omit<PrescriptionMedicine, 'id'>) => {
    const newItem: PrescriptionMedicine = {
      ...drug,
      id: Math.random().toString(36).substring(2, 9),
    };
    onChange((prev) => ({
      ...prev,
      prescriptionItems: [...(prev.prescriptionItems || []), newItem],
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. كارت تفاصيل المريض والتشخيص في أعلى شاشة الروشتة */}
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 p-5 rounded-3xl border border-blue-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-black text-[#0A164E]">
              كتابة الروشتة الطبية والعلاج (Rx)
            </h3>
            <span className="text-xs font-bold text-slate-500">
              | للمريض: <span className="text-[#0040D8] font-black">{patient?.fullName}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1">
            <span><strong>السن:</strong> {patient?.age ? `${patient.age} سنة` : 'غير محدد'}</span>
            <span><strong>رقم الملف:</strong> {examData.fileNo || 'بدون'}</span>
            <span><strong>التاريخ:</strong> {examData.date || new Date().toISOString().slice(0, 10)}</span>
          </div>
        </div>

        {/* خانة التشخيص الطبي السريع */}
        <div className="w-full md:w-80 space-y-1">
          <label className="text-[11px] font-bold text-slate-600 block">
            التشخيص الطبي (Diagnosis):
          </label>
          <input
            type="text"
            value={examData.diagnosis || ''}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, diagnosis: e.target.value }))
            }
            placeholder="مثال: Acute Otitis Media / Sinusitis..."
            className="w-full h-9 px-3 rounded-xl border border-blue-200 bg-white font-bold text-xs text-[#0A164E] focus:outline-none focus:border-[#0040D8] shadow-2xs"
          />
        </div>
      </div>

      {/* 2. الأدوية السريعة الشائعة */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>أدوية الأنف والأذن والحنجرة الأكثر استخداماً (إضافة سريعة بضغطة واحدة):</span>
          </div>
          <span className="text-[11px] text-slate-600 font-medium">
            تضاف مباشرة لجدول الروشتة ويمكنك تعديل الجرعة
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_ENT_DRUGS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addQuickDrug(d)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-[#0040D8] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3 h-3 text-[#0040D8]" />
              <span>{d.drugName.split(' ')[0]} {d.drugName.split(' ')[1] || ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. جدول الروشتة الطبية المخصصة */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-[#0040D8] font-black text-sm">
              ℞
            </div>
            <div>
              <h4 className="font-black text-sm text-[#0A164E]">
                قائمة الأدوية الموصوفة
              </h4>
              <p className="text-[11px] text-slate-600">
                إجمالي الأصناف: <strong className="text-[#0040D8]">{items.length}</strong> دواء
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrintRx}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>طباعة الروشتة للمريض</span>
            </button>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف دواء</span>
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Pill className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              لم تتم إضافة أي أدوية حتى الآن.
            </p>
            <p className="text-[11px] text-slate-600">
              اضغط على أحد الأدوية السريعة بالأعلى أو اضغط &quot;إضافة صنف دواء&quot; لبدء كتابة الروشتة.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl border border-slate-200 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف هذا الدواء"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="font-bold text-[11px] text-slate-600">اسم الدواء (Drug Name) *</label>
                    <input
                      type="text"
                      value={item.drugName}
                      onChange={(e) => updateItem(item.id, 'drugName', e.target.value)}
                      placeholder="Augmentin 1gm, Otrivin..."
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:border-[#0040D8]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-[11px] text-slate-600">الجرعة (Dose)</label>
                    <input
                      type="text"
                      value={item.dose}
                      onChange={(e) => updateItem(item.id, 'dose', e.target.value)}
                      placeholder="1 قرص، بخة..."
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#0040D8]"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-bold text-[11px] text-slate-600">التكرار (Frequency)</label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => updateItem(item.id, 'frequency', e.target.value)}
                      placeholder="كل 12 ساعة، مرتين يومياً..."
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#0040D8]"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-bold text-[11px] text-slate-600">المدة (Duration)</label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                      placeholder="5 أيام، أسبوع..."
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#0040D8]"
                    />
                  </div>

                  <div className="sm:col-span-12 space-y-1">
                    <label className="font-bold text-[11px] text-slate-600">تعليمات وإرشادات الاستخدام (Instructions)</label>
                    <input
                      type="text"
                      value={item.instructions || ''}
                      onChange={(e) => updateItem(item.id, 'instructions', e.target.value)}
                      placeholder="بعد الأكل مباشرة، قبل النوم، رج الزجاجة..."
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 focus:outline-none focus:border-[#0040D8]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ملاحظات وإرشادات الطبيب للمريض */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <label className="font-bold text-xs text-slate-700 block">
            ملاحظات وإرشادات عامة للمريض (Treatment Notes):
          </label>
          <textarea
            rows={3}
            value={examData.treatmentNotes || ''}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, treatmentNotes: e.target.value }))
            }
            placeholder="الراحة، شرب السوائل الدافئة، موانع الاستخدام، متى يجب مراجعة العيادة فوراً..."
            className="w-full p-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#0040D8] resize-none"
          />
        </div>

        {/* موعد المتابعة والاستشارة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-700 shrink-0">موعد الاستشارة / المتابعة:</span>
            <input
              type="date"
              value={examData.followUpDate || ''}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, followUpDate: e.target.value }))
              }
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#0040D8] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. شريط الإجراءات السفلي (العودة لتعديل الكشف + الحفظ + إنهاء الكشف) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        {/* زر العودة لتعديل الكشف الطبي */}
        <button
          type="button"
          onClick={onBackToExam}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>العودة لتعديل بيانات الكشف الطبي</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>

          <button
            type="button"
            onClick={onPrintRx}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-[#0040D8] text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الروشتة للمريض</span>
          </button>

          <button
            type="button"
            onClick={onFinish}
            disabled={isFinishing}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isFinishing ? 'جاري إنهاء الكشف...' : 'إنهاء الكشف وتسليم للاستقبال'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * نموذج الروشتة الطبية الجاهز للطباعة المباشرة على ورقة A5 / A4
 */
export function PrintablePrescriptionSlip({
  examData,
  patient,
  doctor,
}: {
  examData: EntExaminationData;
  patient: any;
  doctor?: any;
}) {
  const items = examData.prescriptionItems || [];

  return (
    <div
      dir="rtl"
      className="bg-white p-8 max-w-2xl mx-auto text-black font-sans space-y-6 border border-slate-300 print:border-none print:p-4 print:max-w-none"
    >
      {/* ترويسة العيادة */}
      <div className="border-b-2 border-black pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-black">
            عيادة الأنف والأذن والحنجرة وجراحات الرأس والرقبة
          </h2>
          <p className="text-sm font-bold text-slate-700">
            {doctor?.name || 'د. إسلام عبدالله كريمة'}
          </p>
          <p className="text-xs text-slate-500">
            أخصائي الأنف والأذن والحنجرة - ماجستير جراحة الأنف والأذن والحنجرة
          </p>
        </div>

        <div className="text-left text-xs font-bold text-slate-700 space-y-0.5" dir="ltr">
          <p>ENT & Head & Neck Surgery Clinic</p>
          <p>Tel: {doctor?.phone || '01018566478'}</p>
        </div>
      </div>

      {/* بيانات المريض */}
      <div className="border-b border-black pb-2 grid grid-cols-3 gap-2 text-xs font-bold">
        <div>
          <span className="text-slate-600">اسم المريض: </span>
          <span className="font-black text-sm">{patient?.fullName}</span>
        </div>
        <div>
          <span className="text-slate-600">السن: </span>
          <span>{patient?.age ? `${patient.age} سنة` : '---'}</span>
        </div>
        <div className="text-left" dir="ltr">
          <span className="text-slate-600">Date: </span>
          <span>{examData.date || new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>

      {examData.diagnosis && (
        <div className="text-xs font-bold">
          <span className="text-slate-600">التشخيص (Diagnosis): </span>
          <span className="font-black text-black underline">{examData.diagnosis}</span>
        </div>
      )}

      {/* رمز الروشتة ℞ والأدوية */}
      <div className="space-y-4 min-h-[350px]">
        <div className="text-3xl font-black text-black">
          ℞
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">لا توجد أدوية مضافة.</p>
        ) : (
          <div className="space-y-3.5 pr-4">
            {items.map((item, idx) => (
              <div key={item.id || idx} className="space-y-0.5 text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-sm">{idx + 1}.</span>
                  <span className="font-black text-sm tracking-wide">{item.drugName}</span>
                  {item.dose && (
                    <span className="text-slate-600 font-bold">({item.dose})</span>
                  )}
                </div>
                <div className="pr-5 text-slate-700 font-medium">
                  {item.frequency && <span>{item.frequency}</span>}
                  {item.duration && <span> - لمدة {item.duration}</span>}
                  {item.instructions && <span className="block text-slate-600 text-[11px] font-bold">◄ {item.instructions}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ملاحظات العلاج */}
      {examData.treatmentNotes && (
        <div className="border-t border-dotted border-black pt-3 text-xs">
          <span className="font-bold text-black block mb-1">تعليمات إضافية:</span>
          <p className="text-slate-700 whitespace-pre-line leading-5">
            {examData.treatmentNotes}
          </p>
        </div>
      )}

      {/* موعد المتابعة وتوقيع الطبيب */}
      <div className="border-t-2 border-black pt-3 flex items-center justify-between text-xs font-bold">
        <div>
          {examData.followUpDate ? (
            <span>موعد الاستشارة: <strong className="underline">{examData.followUpDate}</strong></span>
          ) : (
            <span>الاستشارة خلال أسبوع من تاريخ الكشف</span>
          )}
        </div>
        <div className="text-left" dir="ltr">
          <p>Doctor Signature:</p>
          <p className="font-black text-sm underline">{doctor?.name || 'Dr. Eslam Abdallah'}</p>
        </div>
      </div>
    </div>
  );
}


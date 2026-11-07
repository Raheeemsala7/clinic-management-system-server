'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  CheckCircle2,
  Printer,
  Stethoscope,
  Clock,
  User,
  Phone,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  EntExaminationData,
  PrescriptionMedicine,
} from '../types/ent-examination.types';
import {
  EarAnatomyDiagram,
  NoseAnatomyDiagram,
  MallampatiSelector,
  LarynxVocalCordDiagram,
} from './ent-examination-diagrams';
import { PrescriptionTable } from './prescription-table';
import {
  saveAppointmentExaminationAction,
  finishAndSubmitExamAction,
} from '../apis/examination.action';

interface EntExaminationFormProps {
  appointment: any;
  patient: any;
  doctor: any;
  visit: any;
}

export function EntExaminationForm({
  appointment,
  patient,
  doctor,
  visit,
}: EntExaminationFormProps) {
  const router = useRouter();

  // الحالة الابتدائية لبيانات الفحص
  const existingExam = visit?.entExamination || {};
  const [examData, setExamData] = useState<EntExaminationData>({
    fileNo: existingExam.fileNo || patient?.id?.slice(0, 8) || '',
    date: existingExam.date || appointment?.clinicDate || new Date().toISOString().slice(0, 10),
    residence: existingExam.residence || patient?.address || '',
    maritalStatus: existingExam.maritalStatus || '',
    work: existingExam.work || '',
    habits: existingExam.habits || '',
    smokingIndex: existingExam.smokingIndex || '',

    complaint: existingExam.complaint || visit?.complaint || '',
    historyOfPresentIllness: existingExam.historyOfPresentIllness || '',

    medicalProblems: existingExam.medicalProblems || (patient?.chronicConditions?.join('، ') || ''),
    drugs: existingExam.drugs || '',
    previousOperationsNotRelated: existingExam.previousOperationsNotRelated || '',
    previousOperationsRelated: existingExam.previousOperationsRelated || '',
    familyHistory: existingExam.familyHistory || '',

    ear: existingExam.ear || {
      rt: {},
      lt: {},
      weber: 'Centralized',
      vestibular: {},
    },

    nose: existingExam.nose || {
      rt: {},
      lt: {},
      deformity: '',
    },

    oropharynx: existingExam.oropharynx || {
      mallampati: 'Class I',
    },

    larynx: existingExam.larynx || {},

    investigations: existingExam.investigations || {},

    prescriptionItems: existingExam.prescriptionItems || [],
    treatmentNotes: existingExam.treatmentNotes || visit?.notes || '',

    diagnosis: existingExam.diagnosis || visit?.diagnosis || '',
    followUpDate: existingExam.followUpDate || '',
    operationNeeded: existingExam.operationNeeded || '',
    operativeData: existingExam.operativeData || '',
    secondVisitNotes: existingExam.secondVisitNotes || '',
    thirdVisitNotes: existingExam.thirdVisitNotes || '',
  });

  const [version, setVersion] = useState<number>(visit?.version || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // تحديث الحقول البسيطة
  const updateField = (field: keyof EntExaminationData, val: any) => {
    setExamData((prev) => ({ ...prev, [field]: val }));
  };

  // تحديث فحص الأذن
  const updateEar = (side: 'rt' | 'lt', prop: string, val: string) => {
    setExamData((prev) => ({
      ...prev,
      ear: {
        ...prev.ear,
        [side]: { ...prev.ear[side], [prop]: val },
      },
    }));
  };

  // تحديث فحص الأنف
  const updateNose = (side: 'rt' | 'lt', prop: string, val: string) => {
    setExamData((prev) => ({
      ...prev,
      nose: {
        ...prev.nose,
        [side]: { ...prev.nose[side], [prop]: val },
      },
    }));
  };

  // الحفظ المؤقت التلقائي
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveAppointmentExaminationAction(
        appointment.id,
        visit.id,
        version,
        examData
      );
      if (res.status) {
        toast.success('تم حفظ مسودة الكشف بنجاح');
        setVersion((v) => v + 1);
      } else {
        toast.error(res.message || 'فشل حفظ الكشف');
      }
    } catch (e: any) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  // إنهاء الكشف وتسليم للاستقبال
  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const res = await finishAndSubmitExamAction(
        appointment.id,
        visit.id,
        version,
        examData
      );
      if (res.status) {
        toast.success('تم إنهاء الكشف بنجاح ونقل المريض للاستقبال لتسوية الحساب');
        router.push('/dashboard');
      } else {
        toast.error(res.message || 'فشل اعتماد الكشف');
      }
    } catch (e: any) {
      toast.error('حدث خطأ أثناء إنهاء الكشف');
    } finally {
      setIsFinishing(false);
    }
  };

  // طباعة الورقة
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none">
      {/* 1. الشريط العلوي للإجراءات (يُخفى أثناء الطباعة) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs self-start"
        >
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span>العودة لشاشة الطبيب</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>طباعة الورقة الرسمية</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ مسودة'}</span>
          </button>

          <button
            type="button"
            onClick={handleFinish}
            disabled={isFinishing}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isFinishing ? 'جاري الإنهاء...' : 'إنهاء الكشف وتسليم للاستقبال'}</span>
          </button>
        </div>
      </div>

      {/* ورقة الكشف الطبية الرسمية (ENT Examination Sheet) - مطابقة للصورة */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-10 shadow-sm space-y-6 text-start print:border-none print:shadow-none print:p-0">
        {/* الترويسة العلوية للصورة: File NO | Name | Date */}
        <div className="border-2 border-slate-800 rounded-2xl p-4 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-3 border-b border-slate-300">
            <div className="sm:col-span-3 flex items-center gap-2">
              <span className="font-black text-xs text-slate-700 uppercase">File NO:</span>
              <input
                type="text"
                value={examData.fileNo}
                onChange={(e) => updateField('fileNo', e.target.value)}
                className="w-full h-8 px-2 border-b border-slate-400 bg-transparent text-xs font-mono font-bold focus:outline-none"
              />
            </div>
            <div className="sm:col-span-6 flex items-center gap-2">
              <span className="font-black text-xs text-slate-700 uppercase">Name:</span>
              <span className="text-sm font-black text-[#0A164E]">
                {patient?.fullName}
              </span>
            </div>
            <div className="sm:col-span-3 flex items-center gap-2">
              <span className="font-black text-xs text-slate-700 uppercase">Date:</span>
              <input
                type="date"
                value={examData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full h-8 px-2 border-b border-slate-400 bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* صف الديموغرافيا: Age, Sex, Residence, Marital states, Work, Habits, Smoking index, Tele */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Age:</span>
              <span className="font-bold text-[#0A164E]">{patient?.age || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Sex:</span>
              <span className="font-bold text-[#0A164E]">
                {patient?.gender === 'MALE' ? 'Male' : patient?.gender === 'FEMALE' ? 'Female' : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="font-bold text-slate-600">Residence:</span>
              <input
                type="text"
                value={examData.residence}
                onChange={(e) => updateField('residence', e.target.value)}
                placeholder="محل الإقامة"
                className="w-full border-b border-slate-300 bg-transparent py-0.5 text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Marital:</span>
              <input
                type="text"
                value={examData.maritalStatus}
                onChange={(e) => updateField('maritalStatus', e.target.value)}
                placeholder="أعزب / متزوج"
                className="w-full border-b border-slate-300 bg-transparent py-0.5 text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Work:</span>
              <input
                type="text"
                value={examData.work}
                onChange={(e) => updateField('work', e.target.value)}
                placeholder="المهنة"
                className="w-full border-b border-slate-300 bg-transparent py-0.5 text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Habits:</span>
              <input
                type="text"
                value={examData.habits}
                onChange={(e) => updateField('habits', e.target.value)}
                className="w-full border-b border-slate-300 bg-transparent py-0.5 text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Smoking:</span>
              <input
                type="text"
                value={examData.smokingIndex}
                onChange={(e) => updateField('smokingIndex', e.target.value)}
                placeholder="معدل التدخين"
                className="w-full border-b border-slate-300 bg-transparent py-0.5 text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 col-span-2">
              <span className="font-bold text-slate-600">Tele:</span>
              <span dir="ltr" className="font-mono font-bold text-[#0A164E]">
                {patient?.phone}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Complaint (الشكوى) */}
        <div>
          <label className="font-black text-sm text-[#0A164E] uppercase underline decoration-2 underline-offset-4 block mb-2">
            Complaint :
          </label>
          <textarea
            rows={2}
            value={examData.complaint}
            onChange={(e) => updateField('complaint', e.target.value)}
            placeholder="اكتب شكوى المريض الرئيسية هنا..."
            className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#0040D8] bg-slate-50/30"
          />
        </div>

        {/* 2. History of present illness */}
        <div>
          <label className="font-black text-sm text-[#0A164E] uppercase underline decoration-2 underline-offset-4 block mb-2">
            History of present illness :
          </label>
          <textarea
            rows={3}
            value={examData.historyOfPresentIllness}
            onChange={(e) => updateField('historyOfPresentIllness', e.target.value)}
            placeholder="بداية الأعراض، التدرج، العوامل المهدئة أو المحفزة..."
            className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#0040D8] bg-slate-50/30"
          />
        </div>

        {/* 3. Past history & Family history */}
        <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200 text-xs">
          <span className="font-black text-sm text-[#0A164E] uppercase underline decoration-2 underline-offset-4 block">
            Past history :
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">- Medical problems:</span>
              <input
                type="text"
                value={examData.medicalProblems}
                onChange={(e) => updateField('medicalProblems', e.target.value)}
                placeholder="ضغط، سكر، حساسية صدر..."
                className="w-full border-b border-slate-300 bg-transparent py-1 font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">- Drugs:</span>
              <input
                type="text"
                value={examData.drugs}
                onChange={(e) => updateField('drugs', e.target.value)}
                placeholder="الأدوية الحالية المستمرة"
                className="w-full border-b border-slate-300 bg-transparent py-1 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-700 block">- Previous operations:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">(Not related):</span>
                <input
                  type="text"
                  value={examData.previousOperationsNotRelated}
                  onChange={(e) => updateField('previousOperationsNotRelated', e.target.value)}
                  className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">(Related):</span>
                <input
                  type="text"
                  value={examData.previousOperationsRelated}
                  onChange={(e) => updateField('previousOperationsRelated', e.target.value)}
                  className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <span className="font-black text-slate-700">Family history:</span>
            <input
              type="text"
              value={examData.familyHistory}
              onChange={(e) => updateField('familyHistory', e.target.value)}
              className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Examination : Ear (فحص الأذن مطابقة للصورة 1) */}
        <div className="border-2 border-blue-200 rounded-3xl p-5 bg-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-base font-black text-[#0A164E] uppercase underline decoration-[#0040D8] decoration-2 underline-offset-4">
              Examination : Ear
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Rt Ear Column */}
            <div className="lg:col-span-4 space-y-2 text-xs">
              <span className="font-black text-sm text-[#0040D8] block mb-2">Right Ear (Rt)</span>
              {[
                'swelling',
                'tenderness',
                'discharge',
                'rinne',
                'fistula',
                'deformity',
                'battleSign',
                'facialPalsy',
                'others',
              ].map((key) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600 capitalize">
                    - {key === 'battleSign' ? 'Battle sign' : key === 'facialPalsy' ? 'Facial palsy' : key}:
                  </span>
                  <input
                    type="text"
                    value={(examData.ear.rt as any)[key] || ''}
                    onChange={(e) => updateEar('rt', key, e.target.value)}
                    className="w-32 h-7 px-2 border-b border-slate-300 bg-slate-50/50 rounded text-xs focus:outline-none focus:border-[#0040D8]"
                  />
                </div>
              ))}
            </div>

            {/* Ear Diagram in Center */}
            <div className="lg:col-span-4">
              <EarAnatomyDiagram
                selectedWeber={examData.ear.weber}
                onSelectWeber={(val) =>
                  setExamData((prev) => ({
                    ...prev,
                    ear: { ...prev.ear, weber: val },
                  }))
                }
              />
            </div>

            {/* Lt Ear Column */}
            <div className="lg:col-span-4 space-y-2 text-xs">
              <span className="font-black text-sm text-[#0040D8] block mb-2">Left Ear (Lt)</span>
              {[
                'swelling',
                'tenderness',
                'discharge',
                'rinne',
                'fistula',
                'deformity',
                'battleSign',
                'facialPalsy',
                'others',
              ].map((key) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600 capitalize">
                    - {key === 'battleSign' ? 'Battle sign' : key === 'facialPalsy' ? 'Facial palsy' : key}:
                  </span>
                  <input
                    type="text"
                    value={(examData.ear.lt as any)[key] || ''}
                    onChange={(e) => updateEar('lt', key, e.target.value)}
                    className="w-32 h-7 px-2 border-b border-slate-300 bg-slate-50/50 rounded text-xs focus:outline-none focus:border-[#0040D8]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Vestibular Assessment (أسفل الأذن كما بالصورة) */}
          <div className="pt-4 border-t border-slate-200">
            <span className="font-black text-xs text-[#0A164E] uppercase underline block mb-3">
              Vestibular Assessment :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                { key: 'rombergTest', label: 'Romberg test' },
                { key: 'dexahallpike', label: 'Dexahallpike' },
                { key: 'highSteppage', label: 'High steppage' },
                { key: 'headShaking', label: 'Head Shaking' },
                { key: 'headThrust', label: 'Head Thrust (Impulse)' },
                { key: 'caloricTest', label: 'Caloric test' },
                { key: 'others', label: 'Others' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 shrink-0">- {label}:</span>
                  <input
                    type="text"
                    value={(examData.ear.vestibular as any)[key] || ''}
                    onChange={(e) =>
                      setExamData((prev) => ({
                        ...prev,
                        ear: {
                          ...prev.ear,
                          vestibular: {
                            ...prev.ear.vestibular,
                            [key]: e.target.value,
                          },
                        },
                      }))
                    }
                    className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Nose (فحص الأنف مطابقة للصورة 2) */}
        <div className="border-2 border-indigo-200 rounded-3xl p-5 bg-white space-y-4">
          <h4 className="text-base font-black text-[#0A164E] uppercase underline decoration-indigo-600 decoration-2 underline-offset-4">
            Nose
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Rt Nose Column */}
            <div className="lg:col-span-4 space-y-2 text-xs">
              <span className="font-black text-sm text-indigo-700 block mb-2">Right (Rt)</span>
              {[
                { key: 'septum', label: 'Septum' },
                { key: 'infTurbinate', label: 'Inf Turbinate' },
                { key: 'bleeders', label: 'Bleeders' },
                { key: 'discharge', label: 'Discharge' },
                { key: 'polypsGrade', label: 'Polyps: Grade' },
                { key: 'mass', label: 'Mass' },
                { key: 'eye', label: 'Eye' },
                { key: 'nasopharynx', label: 'Nasopharynx' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">{label}:</span>
                  <input
                    type="text"
                    value={(examData.nose.rt as any)[key] || ''}
                    onChange={(e) => updateNose('rt', key, e.target.value)}
                    className="w-32 h-7 px-2 border-b border-slate-300 bg-slate-50/50 rounded text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              ))}
            </div>

            {/* Nose Pyramid in Center */}
            <div className="lg:col-span-4 flex flex-col items-center gap-3">
              <NoseAnatomyDiagram />
              <div className="flex items-center gap-2 w-full max-w-xs text-xs">
                <span className="font-black text-slate-700 shrink-0">Deformity:</span>
                <input
                  type="text"
                  value={examData.nose.deformity || ''}
                  onChange={(e) =>
                    setExamData((prev) => ({
                      ...prev,
                      nose: { ...prev.nose, deformity: e.target.value },
                    }))
                  }
                  placeholder="انحراف أو تشوه خارجي"
                  className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Lt Nose Column */}
            <div className="lg:col-span-4 space-y-2 text-xs">
              <span className="font-black text-sm text-indigo-700 block mb-2">Left (Lt)</span>
              {[
                { key: 'septum', label: 'Septum' },
                { key: 'infTurbinate', label: 'Inf Turbinate' },
                { key: 'bleeders', label: 'Bleeders' },
                { key: 'discharge', label: 'Discharge' },
                { key: 'polypsGrade', label: 'Polyps: Grade' },
                { key: 'mass', label: 'Mass' },
                { key: 'eye', label: 'Eye' },
                { key: 'edema', label: 'Edema' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">{label}:</span>
                  <input
                    type="text"
                    value={(examData.nose.lt as any)[key] || ''}
                    onChange={(e) => updateNose('lt', key, e.target.value)}
                    className="w-32 h-7 px-2 border-b border-slate-300 bg-slate-50/50 rounded text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Oropharynx (البلعوم الفموي وتصنيف مالامباتي) */}
        <div className="border-2 border-amber-200 rounded-3xl p-5 bg-white space-y-4">
          <h4 className="text-base font-black text-[#0A164E] uppercase underline decoration-amber-500 decoration-2 underline-offset-4">
            Oropharynx
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'tonsils', label: 'Tonsils' },
                { key: 'adenoid', label: 'Adenoid' },
                { key: 'softPalate', label: 'Soft palate' },
                { key: 'uvula', label: 'Uvula' },
                { key: 'tongue', label: 'Tongue' },
                { key: 'sublingualArea', label: 'Sublingual area' },
                { key: 'buccalMucosa', label: 'Buccal mucosa' },
                { key: 'signsOfReflux', label: 'Signs of reflux' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 shrink-0">{label}:</span>
                  <input
                    type="text"
                    value={(examData.oropharynx as any)[key] || ''}
                    onChange={(e) =>
                      setExamData((prev) => ({
                        ...prev,
                        oropharynx: { ...prev.oropharynx, [key]: e.target.value },
                      }))
                    }
                    className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="lg:col-span-5">
              <MallampatiSelector
                selectedClass={examData.oropharynx.mallampati}
                onSelect={(val) =>
                  setExamData((prev) => ({
                    ...prev,
                    oropharynx: { ...prev.oropharynx, mallampati: val as any },
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* 7. Larynx & Head & Neck (الحنجرة والرأس والرقبة) */}
        <div className="border-2 border-emerald-200 rounded-3xl p-5 bg-white space-y-4">
          <h4 className="text-base font-black text-[#0A164E] uppercase underline decoration-emerald-600 decoration-2 underline-offset-4">
            Larynx & Head & Neck
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'lymphNode', label: 'Lymph node' },
                { key: 'swelling', label: 'Swelling' },
                { key: 'mouresSign', label: "Moure's sign" },
                { key: 'thyroid', label: 'Thyroid' },
                { key: 'parotid', label: 'Parotid' },
                { key: 'submandibular', label: 'Submandibular' },
                { key: 'indirectLaryngoscope', label: 'Indirect laryngoscope' },
                { key: 'others', label: 'Others' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 shrink-0">{label}:</span>
                  <input
                    type="text"
                    value={(examData.larynx as any)[key] || ''}
                    onChange={(e) =>
                      setExamData((prev) => ({
                        ...prev,
                        larynx: { ...prev.larynx, [key]: e.target.value },
                      }))
                    }
                    className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <LarynxVocalCordDiagram />
            </div>
          </div>
        </div>

        {/* 8. Investigations (الفحوصات والأشعة) */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3 text-xs">
          <span className="font-black text-sm text-[#0A164E] uppercase underline block">
            Investigations :
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">- Present:</span>
                <input
                  type="text"
                  value={examData.investigations.present || ''}
                  onChange={(e) =>
                    setExamData((prev) => ({
                      ...prev,
                      investigations: {
                        ...prev.investigations,
                        present: e.target.value,
                      },
                    }))
                  }
                  placeholder="فحوصات أحضرها المريض معه"
                  className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Revealed:</span>
                <input
                  type="text"
                  value={examData.investigations.presentRevealed || ''}
                  onChange={(e) =>
                    setExamData((prev) => ({
                      ...prev,
                      investigations: {
                        ...prev.investigations,
                        presentRevealed: e.target.value,
                      },
                    }))
                  }
                  className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">- Need:</span>
                <input
                  type="text"
                  value={examData.investigations.need || ''}
                  onChange={(e) =>
                    setExamData((prev) => ({
                      ...prev,
                      investigations: {
                        ...prev.investigations,
                        need: e.target.value,
                      },
                    }))
                  }
                  placeholder="فحوصات أو أشعة مطلوبة من المريض"
                  className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Revealed:</span>
                <input
                  type="text"
                  value={examData.investigations.needRevealed || ''}
                  onChange={(e) =>
                    setExamData((prev) => ({
                      ...prev,
                      investigations: {
                        ...prev.investigations,
                        needRevealed: e.target.value,
                      },
                    }))
                  }
                  className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 9. Treatment & Prescription (الروشتة والعلاج) */}
        <div className="border-2 border-blue-400 rounded-3xl p-6 bg-white space-y-4 shadow-xs">
          <PrescriptionTable
            items={examData.prescriptionItems}
            onChange={(items) => updateField('prescriptionItems', items)}
            onPrint={handlePrint}
          />

          <div className="pt-3 border-t border-slate-100">
            <label className="font-bold text-xs text-slate-600 block mb-1">
              ملاحظات إضافية على العلاج (Treatment notes):
            </label>
            <input
              type="text"
              value={examData.treatmentNotes || ''}
              onChange={(e) => updateField('treatmentNotes', e.target.value)}
              placeholder="نصائح طبية، موانع استخدام، إرشادات للمريض..."
              className="w-full h-9 px-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0040D8]"
            />
          </div>
        </div>

        {/* 10. Diagnosis, Operations & Follow up (التشخيص والمتابعة والعمليات) */}
        <div className="space-y-4 pt-4 border-t-2 border-slate-800 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-[#0A164E] uppercase underline shrink-0">
                Diagnosis :
              </span>
              <input
                type="text"
                value={examData.diagnosis || ''}
                onChange={(e) => updateField('diagnosis', e.target.value)}
                placeholder="التشخيص الطبي النهائي"
                className="w-full border-b-2 border-slate-700 bg-transparent py-1 font-black text-sm text-[#0A164E] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-[#0A164E] uppercase underline shrink-0">
                Follow up :
              </span>
              <input
                type="date"
                value={examData.followUpDate || ''}
                onChange={(e) => updateField('followUpDate', e.target.value)}
                className="w-full border-b border-slate-400 bg-transparent py-1 font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-700 uppercase underline shrink-0">
                Operation Needed :
              </span>
              <input
                type="text"
                value={examData.operationNeeded || ''}
                onChange={(e) => updateField('operationNeeded', e.target.value)}
                placeholder="العملية الجراحية المطلوبة"
                className="w-full border-b border-slate-300 bg-transparent py-0.5 font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-slate-700 uppercase underline shrink-0">
                Operative data :
              </span>
              <input
                type="text"
                value={examData.operativeData || ''}
                onChange={(e) => updateField('operativeData', e.target.value)}
                placeholder="بيانات العملية"
                className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 shrink-0">2nd Visit:</span>
              <input
                type="text"
                value={examData.secondVisitNotes || ''}
                onChange={(e) => updateField('secondVisitNotes', e.target.value)}
                className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 shrink-0">3rd Visit:</span>
              <input
                type="text"
                value={examData.thirdVisitNotes || ''}
                onChange={(e) => updateField('thirdVisitNotes', e.target.value)}
                className="w-full border-b border-slate-300 bg-transparent py-0.5 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* توقيع الطبيب في أسفل الورقة المطبوعة */}
        <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span>تاريخ الزيارة: </span>
            <span className="font-bold text-[#0A164E]">{examData.date}</span>
          </div>
          <div>
            <span>توقيع الطبيب المعالج: </span>
            <span className="font-black text-[#0A164E]">{doctor?.name || 'د. إسلام عبدالله كريمة'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


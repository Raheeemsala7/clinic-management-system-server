'use client';

import React from 'react';
import {
  EntExaminationData,
} from '../types/ent-examination.types';
import {
  EarAnatomyDiagram,
  NoseAnatomyDiagram,
  MallampatiSelector,
  LarynxVocalCordDiagram,
} from './ent-examination-diagrams';

interface EntPaperSheetProps {
  examData: EntExaminationData;
  patient: any;
  doctor?: any;
  onChange: (updater: (prev: EntExaminationData) => EntExaminationData) => void;
  isPrintOnly?: boolean;
}

/**
 * شيت الكشف الطبي الكامل لعيادة الأنف والأذن والحنجرة
 * مطابق 100% للأصل الورقي في الصورتين (الصفحة الأولى والصفحة الثانية)
 */
export function EntPaperSheet({
  examData,
  patient,
  doctor,
  onChange,
  isPrintOnly = false,
}: EntPaperSheetProps) {
  // تحديث حقل مباشر
  const setField = <K extends keyof EntExaminationData>(key: K, value: EntExaminationData[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  // تحديث فحص الأذن
  const updateEar = (side: 'rt' | 'lt', prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      ear: {
        ...prev.ear,
        [side]: { ...prev.ear[side], [prop]: val },
      },
    }));
  };

  // تحديث فحص الاتزان
  const updateVestibular = (prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      ear: {
        ...prev.ear,
        vestibular: { ...prev.ear.vestibular, [prop]: val },
      },
    }));
  };

  // تحديث فحص الأنف
  const updateNose = (side: 'rt' | 'lt', prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      nose: {
        ...prev.nose,
        [side]: { ...prev.nose[side], [prop]: val },
      },
    }));
  };

  // تحديث فحص البلعوم
  const updateOropharynx = (prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      oropharynx: { ...prev.oropharynx, [prop]: val },
    }));
  };

  // تحديث فحص الحنجرة والرقبة
  const updateLarynx = (prop: string, val: string) => {
    onChange((prev) => ({
      ...prev,
      larynx: { ...prev.larynx, [prop]: val },
    }));
  };

  // قائمة عناصر فحص الأذن
  const earItems = [
    { id: 'swelling', label: 'Swelling' },
    { id: 'tenderness', label: 'Tenderness' },
    { id: 'discharge', label: 'Discharge' },
    { id: 'rinne', label: 'Rinné' },
    { id: 'fistula', label: 'Fistula' },
    { id: 'deformity', label: 'Deformity' },
    { id: 'battleSign', label: 'Battle sign' },
    { id: 'facialPalsy', label: 'Facial palsy' },
    { id: 'others', label: 'Others' },
  ];

  // قائمة عناصر فحص الأنف
  const noseItems = [
    { id: 'septum', label: 'Septum' },
    { id: 'infTurbinate', label: 'Inf Turbinate' },
    { id: 'bleeders', label: 'Bleeders' },
    { id: 'discharge', label: 'Discharge' },
    { id: 'polypsGrade', label: 'Polyps: Grade' },
    { id: 'mass', label: 'Mass' },
    { id: 'eye', label: 'Eye' },
    { id: 'nasopharynx', label: 'Nasopharynx' },
  ];

  // قائمة عناصر فحص الحنجرة والرقبة
  const larynxItems = [
    { id: 'lymphNode', label: 'Lymph node' },
    { id: 'swelling', label: 'Swelling' },
    { id: 'mouresSign', label: "Moure's sign" },
    { id: 'thyroid', label: 'Thyroid' },
    { id: 'parotid', label: 'Parotid' },
    { id: 'submandibular', label: 'Submandibular' },
    { id: 'indirectLaryngoscope', label: 'Indirect laryngoscope' },
    { id: 'others', label: 'Others' },
  ];

  return (
    <div
      dir="ltr"
      className="w-full text-black font-serif select-text space-y-8 print:space-y-0 print:p-0 print:m-0"
    >
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 6mm 6mm 6mm;
          }
          html, body {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            background: white !important;
          }
          .sheet-page-1 {
            page-break-after: always !important;
            break-after: page !important;
            display: block !important;
          }
          .sheet-page-2 {
            page-break-before: always !important;
            break-before: page !important;
            display: block !important;
          }
        }
      `}</style>

      {/* ============================================================== */}
      {/* 📄 الورقة الأولى (Sheet 1) - مطابقة تماماً للصورة الأولى         */}
      {/* ============================================================== */}
      <div className="sheet-page-1 bg-white border-2 border-black p-4 sm:p-5 rounded-none shadow-sm space-y-3 print:border-2 print:border-black print:p-4 print:shadow-none print:w-full">
        {/* الترويسة العلوية: File NO | Name | Date */}
        <div className="border border-black grid grid-cols-12 text-[13px]">
          <div className="col-span-3 border-r border-black p-1.5 flex items-baseline gap-1">
            <span className="font-bold uppercase tracking-tight shrink-0">File NO:</span>
            <input
              type="text"
              value={examData.fileNo || ''}
              onChange={(e) => setField('fileNo', e.target.value)}
              className="w-full bg-transparent border-none p-0 text-[13px] font-mono font-bold focus:outline-none"
            />
          </div>
          <div className="col-span-6 border-r border-black p-1.5 flex items-baseline gap-1">
            <span className="font-bold uppercase tracking-tight shrink-0">Name:</span>
            <span className="font-black text-[14px] text-black">
              {patient?.fullName || '................................................'}
            </span>
          </div>
          <div className="col-span-3 p-1.5 flex items-baseline gap-1">
            <span className="font-bold uppercase tracking-tight shrink-0">Date:</span>
            <input
              type="text"
              value={examData.date || ''}
              onChange={(e) => setField('date', e.target.value)}
              className="w-full bg-transparent border-none p-0 text-[13px] font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* سطر البيانات الديموغرافية الأول: Age | Sex | Residence | Marital states */}
        <div className="grid grid-cols-12 gap-2 text-[12px] pt-1">
          <div className="col-span-2 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Age:</span>
            <span className="w-full border-b border-dotted border-black px-1 font-bold">
              {patient?.age ? `${patient.age} Y` : '......'}
            </span>
          </div>
          <div className="col-span-2 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Sex:</span>
            <span className="w-full border-b border-dotted border-black px-1 font-bold">
              {patient?.gender === 'MALE' ? 'Male' : patient?.gender === 'FEMALE' ? 'Female' : '......'}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Residence:</span>
            <input
              type="text"
              value={examData.residence || ''}
              onChange={(e) => setField('residence', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] focus:outline-none"
            />
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Marital states:</span>
            <input
              type="text"
              value={examData.maritalStatus || ''}
              onChange={(e) => setField('maritalStatus', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] focus:outline-none"
            />
          </div>
        </div>

        {/* سطر البيانات الديموغرافية الثاني: Work | Habits | Smoking index | Tele */}
        <div className="grid grid-cols-12 gap-2 text-[12px]">
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Work:</span>
            <input
              type="text"
              value={examData.work || ''}
              onChange={(e) => setField('work', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] focus:outline-none"
            />
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Habits:</span>
            <input
              type="text"
              value={examData.habits || ''}
              onChange={(e) => setField('habits', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] focus:outline-none"
            />
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Smoking index:</span>
            <input
              type="text"
              value={examData.smokingIndex || ''}
              onChange={(e) => setField('smokingIndex', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] focus:outline-none"
            />
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="font-bold shrink-0">Tele:</span>
            <span className="w-full border-b border-dotted border-black px-1 font-mono text-[11px] font-bold">
              {patient?.phone || '............'}
            </span>
          </div>
        </div>

        {/* Complaint (الشكوى الرئيسية) */}
        <div className="space-y-1 pt-1">
          <span className="font-bold text-[13px] underline block">Complaint:</span>
          <textarea
            rows={2}
            value={examData.complaint || ''}
            onChange={(e) => setField('complaint', e.target.value)}
            placeholder="اكتب شكوى المريض الرئيسية..."
            className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] leading-6 focus:outline-none resize-none"
          />
        </div>

        {/* History of present illness (تاريخ المرض الحالي) */}
        <div className="space-y-1">
          <span className="font-bold text-[13px] underline block">History of present illness:</span>
          <textarea
            rows={5}
            value={examData.historyOfPresentIllness || ''}
            onChange={(e) => setField('historyOfPresentIllness', e.target.value)}
            placeholder="تفاصيل الشكوى الحالية وتطور الأعراض..."
            className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] leading-6 focus:outline-none resize-none"
          />
        </div>

        {/* Past history (التاريخ المرضي السابق) */}
        <div className="space-y-1.5 text-[12px]">
          <span className="font-bold text-[13px] underline block">Past history:</span>

          <div className="flex items-baseline gap-1">
            <span className="font-bold shrink-0">- Medical problems:</span>
            <input
              type="text"
              value={examData.medicalProblems || ''}
              onChange={(e) => setField('medicalProblems', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold shrink-0">- Drugs:</span>
            <input
              type="text"
              value={examData.drugs || ''}
              onChange={(e) => setField('drugs', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold shrink-0">- Previous operations: (Not related)</span>
            <input
              type="text"
              value={examData.previousOperationsNotRelated || ''}
              onChange={(e) => setField('previousOperationsNotRelated', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
            />
          </div>

          <div className="flex items-baseline gap-1 pl-6">
            <span className="font-bold shrink-0">(Related)</span>
            <input
              type="text"
              value={examData.previousOperationsRelated || ''}
              onChange={(e) => setField('previousOperationsRelated', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[13px] shrink-0">Family history:</span>
            <input
              type="text"
              value={examData.familyHistory || ''}
              onChange={(e) => setField('familyHistory', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
            />
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Examination : & فحص الأذن (Ear) المكبّر والمطابق للصورة المرفقة */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[13px] underline block">Examination :</span>
          </div>

          <div className="grid grid-cols-12 gap-1.5 items-start">
            {/* القائمة اليسرى (Rt Ear) */}
            <div className="col-span-2 space-y-1 text-[12px] pt-4">
              {earItems.map((it) => (
                <div key={it.id} className="flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[10px] sm:text-[11px]">- {it.label}:</span>
                  <input
                    type="text"
                    value={(examData.ear.rt as any)?.[it.id] || ''}
                    onChange={(e) => updateEar('rt', it.id, e.target.value)}
                    className="w-full border-b border-dotted border-black bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* في المنتصف: رسم الأذن التشريحي المكبّر إلى أقصى حد ممكن واختبار ويبر مع إمكانية الرسم بالقلم */}
            <div className="col-span-8 flex flex-col items-center justify-center">
              <EarAnatomyDiagram
                selectedWeber={examData.ear.weber}
                onSelectWeber={(val) =>
                  onChange((prev) => ({
                    ...prev,
                    ear: { ...prev.ear, weber: val },
                  }))
                }
                drawing={examData.ear.drawing}
                onSaveDrawing={(val) =>
                  onChange((prev) => ({
                    ...prev,
                    ear: { ...prev.ear, drawing: val },
                  }))
                }
                readOnly={isPrintOnly}
              />
            </div>

            {/* القائمة اليمنى (Lt Ear) */}
            <div className="col-span-2 space-y-1 text-[12px] pt-4">
              {earItems.map((it) => (
                <div key={it.id} className="flex items-baseline gap-1">
                  <span className="font-bold shrink-0 text-[10px] sm:text-[11px]">- {it.label}:</span>
                  <input
                    type="text"
                    value={(examData.ear.lt as any)?.[it.id] || ''}
                    onChange={(e) => updateEar('lt', it.id, e.target.value)}
                    className="w-full border-b border-dotted border-black bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* فحص الاتزان (Vestibular Assessment) - 3 أعمدة */}
        <div className="space-y-1.5 text-[12px]">
          <span className="font-bold text-[13px] underline block">Vestibular Assessment:</span>

          <div className="grid grid-cols-12 gap-3">
            {/* العمود 1 */}
            <div className="col-span-4 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Romberg test:</span>
                <input
                  type="text"
                  value={examData.ear.vestibular?.rombergTest || ''}
                  onChange={(e) => updateVestibular('rombergTest', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Head Shaking:</span>
                <input
                  type="text"
                  value={examData.ear.vestibular?.headShaking || ''}
                  onChange={(e) => updateVestibular('headShaking', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Others:</span>
                <input
                  type="text"
                  value={examData.ear.vestibular?.others || ''}
                  onChange={(e) => updateVestibular('others', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
            </div>

            {/* العمود 2 */}
            <div className="col-span-4 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Dexahallpike:</span>
                <input
                  type="text"
                  value={examData.ear.vestibular?.dexahallpike || ''}
                  onChange={(e) => updateVestibular('dexahallpike', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Head Thrust (Impulse):</span>
                <input
                  type="text"
                  value={examData.ear.vestibular?.headThrust || ''}
                  onChange={(e) => updateVestibular('headThrust', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
            </div>

            {/* العمود 3 */}
            <div className="col-span-4 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- High steppage:</span>
                <input
                  type="text"
                  value={examData.ear.vestibular?.highSteppage || ''}
                  onChange={(e) => updateVestibular('highSteppage', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">- Caloric test:</span>
                <input
                  type="text"
                  value={examData.ear.vestibular?.caloricTest || ''}
                  onChange={(e) => updateVestibular('caloricTest', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 📄 الورقة الثانية (Sheet 2) - مطابقة تماماً للصورة الثانية       */}
      {/* ============================================================== */}
      <div className="sheet-page-2 bg-white border-2 border-black p-4 sm:p-5 rounded-none shadow-sm space-y-3 print:border-2 print:border-black print:p-4 print:shadow-none print:w-full">
        {/* عنوان فحص الأنف (Nose) في المنتصف */}
        <div className="text-center font-bold text-[16px] underline">
          Nose
        </div>

        {/* فحص الأنف المفصل مع رسم الهرم الأنفي */}
        <div className="grid grid-cols-12 gap-3 items-start">
          {/* القائمة اليسرى (Rt Nose) */}
          <div className="col-span-4 space-y-1 text-[12px]">
            {noseItems.map((it) => (
              <div key={it.id} className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">{it.label}:</span>
                <input
                  type="text"
                  value={(examData.nose.rt as any)?.[it.id] || ''}
                  onChange={(e) => updateNose('rt', it.id, e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* في المنتصف: رسم الهرم الأنفي + Deformity & Edema مع إمكانية الرسم بالقلم */}
          <div className="col-span-4 flex flex-col items-center justify-center space-y-1">
            <NoseAnatomyDiagram
              drawing={examData.nose.drawing}
              onSaveDrawing={(val) =>
                onChange((prev) => ({
                  ...prev,
                  nose: { ...prev.nose, drawing: val },
                }))
              }
              readOnly={isPrintOnly}
            />
            <div className="w-full space-y-1 text-[11px]">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Deformity:</span>
                <input
                  type="text"
                  value={examData.nose.deformity || ''}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      nose: { ...prev.nose, deformity: e.target.value },
                    }))
                  }
                  className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Edema:</span>
                <input
                  type="text"
                  value={examData.nose.rt?.edema || ''}
                  onChange={(e) => updateNose('rt', 'edema', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* القائمة اليمنى (Lt Nose) */}
          <div className="col-span-4 space-y-1 text-[12px]">
            {noseItems.map((it) => (
              <div key={it.id} className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">{it.label}:</span>
                <input
                  type="text"
                  value={(examData.nose.lt as any)?.[it.id] || ''}
                  onChange={(e) => updateNose('lt', it.id, e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Oropharynx & Mallampati classification */}
        <div className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-7 space-y-2">
            <span className="font-bold text-[14px] underline block">Oropharynx</span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Tonsils:</span>
                <input
                  type="text"
                  value={examData.oropharynx.tonsils || ''}
                  onChange={(e) => updateOropharynx('tonsils', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Adenoid:</span>
                <input
                  type="text"
                  value={examData.oropharynx.adenoid || ''}
                  onChange={(e) => updateOropharynx('adenoid', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Soft palate:</span>
                <input
                  type="text"
                  value={examData.oropharynx.softPalate || ''}
                  onChange={(e) => updateOropharynx('softPalate', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Uvula:</span>
                <input
                  type="text"
                  value={examData.oropharynx.uvula || ''}
                  onChange={(e) => updateOropharynx('uvula', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Tongue:</span>
                <input
                  type="text"
                  value={examData.oropharynx.tongue || ''}
                  onChange={(e) => updateOropharynx('tongue', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Sublingual area:</span>
                <input
                  type="text"
                  value={examData.oropharynx.sublingualArea || ''}
                  onChange={(e) => updateOropharynx('sublingualArea', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Buccal mucosa:</span>
                <input
                  type="text"
                  value={examData.oropharynx.buccalMucosa || ''}
                  onChange={(e) => updateOropharynx('buccalMucosa', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold shrink-0">Signs of reflux:</span>
                <input
                  type="text"
                  value={examData.oropharynx.signsOfReflux || ''}
                  onChange={(e) => updateOropharynx('signsOfReflux', e.target.value)}
                  className="w-full border-b border-dotted border-black bg-transparent px-1 text-[11px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <MallampatiSelector
              selectedClass={examData.oropharynx.mallampati}
              onSelect={(val) =>
                onChange((prev) => ({
                  ...prev,
                  oropharynx: { ...prev.oropharynx, mallampati: val },
                }))
              }
            />
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Larynx & Head & Neck */}
        <div className="space-y-1">
          <div className="text-center font-bold text-[15px] underline">
            Larynx & Head & Neck
          </div>

          <div className="grid grid-cols-12 gap-3 items-start">
            <div className="col-span-8 space-y-1 text-[12px]">
              {larynxItems.map((it) => (
                <div key={it.id} className="flex items-baseline gap-1">
                  <span className="font-bold shrink-0">{it.label}:</span>
                  <input
                    type="text"
                    value={(examData.larynx as any)?.[it.id] || ''}
                    onChange={(e) => updateLarynx(it.id, e.target.value)}
                    className="w-full border-b border-dotted border-black bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="col-span-4 flex flex-col items-center justify-center pt-1">
              <LarynxVocalCordDiagram
                drawing={examData.larynx.drawing}
                onSaveDrawing={(val) =>
                  onChange((prev) => ({
                    ...prev,
                    larynx: { ...prev.larynx, drawing: val },
                  }))
                }
                readOnly={isPrintOnly}
              />
            </div>
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Investigations */}
        <div className="space-y-1.5 text-[12px]">
          <span className="font-bold text-[13px] underline block">Investigations:</span>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6 flex items-baseline gap-1">
              <span className="font-bold shrink-0">- Present:</span>
              <input
                type="text"
                value={examData.investigations.present || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    investigations: { ...prev.investigations, present: e.target.value },
                  }))
                }
                className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
              />
            </div>
            <div className="col-span-6 flex items-baseline gap-1">
              <span className="font-bold shrink-0">Revealed:</span>
              <input
                type="text"
                value={examData.investigations.presentRevealed || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    investigations: { ...prev.investigations, presentRevealed: e.target.value },
                  }))
                }
                className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6 flex items-baseline gap-1">
              <span className="font-bold shrink-0">- Need:</span>
              <input
                type="text"
                value={examData.investigations.need || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    investigations: { ...prev.investigations, need: e.target.value },
                  }))
                }
                className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
              />
            </div>
            <div className="col-span-6 flex items-baseline gap-1">
              <span className="font-bold shrink-0">Revealed:</span>
              <input
                type="text"
                value={examData.investigations.needRevealed || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    investigations: { ...prev.investigations, needRevealed: e.target.value },
                  }))
                }
                className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Treatment (ملاحظات العلاج الأساسية بالورقة) */}
        <div className="space-y-1">
          <span className="font-bold text-[13px] underline block">Treatment:</span>
          <textarea
            rows={2}
            value={examData.treatmentNotes || ''}
            onChange={(e) => setField('treatmentNotes', e.target.value)}
            className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] leading-6 focus:outline-none resize-none"
          />
        </div>

        {/* خط فاصل منقط */}
        <div className="border-b border-dotted border-black my-2" />

        {/* Follow up & Diagnosis & Operations */}
        <div className="space-y-1.5 text-[12px]">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[13px] underline shrink-0">Follow up:</span>
            <input
              type="text"
              value={examData.followUpDate || ''}
              onChange={(e) => setField('followUpDate', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none font-bold"
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[13px] underline shrink-0">Diagnosis:</span>
            <input
              type="text"
              value={examData.diagnosis || ''}
              onChange={(e) => setField('diagnosis', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none font-bold text-[13px]"
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[13px] underline shrink-0">Operation Needed:</span>
            <input
              type="text"
              value={examData.operationNeeded || ''}
              onChange={(e) => setField('operationNeeded', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="font-bold text-[13px] underline block">Operative data:</span>
            <textarea
              rows={2}
              value={examData.operativeData || ''}
              onChange={(e) => setField('operativeData', e.target.value)}
              className="w-full border-b border-dotted border-black bg-transparent px-1 text-[12px] leading-6 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="flex items-baseline gap-1">
              <span className="font-bold shrink-0">2nd Visit:</span>
              <input
                type="text"
                value={examData.secondVisitNotes || ''}
                onChange={(e) => setField('secondVisitNotes', e.target.value)}
                className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold shrink-0">3rd Visit:</span>
              <input
                type="text"
                value={examData.thirdVisitNotes || ''}
                onChange={(e) => setField('thirdVisitNotes', e.target.value)}
                className="w-full border-b border-dotted border-black bg-transparent px-1 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* توقيع الطبيب وتاريخ الزيارة */}
        <div className="pt-4 border-t border-black flex items-center justify-between text-[11px] font-bold">
          <div>
            <span>Date: </span>
            <span>{examData.date}</span>
          </div>
          <div>
            <span>Doctor Signature: </span>
            <span className="font-black underline">{doctor?.name || 'د. إسلام عبدالله كريمة'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


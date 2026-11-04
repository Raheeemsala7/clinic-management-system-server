'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PatientDetails } from '../types/patient';

interface PatientHeroBannerProps {
  details: PatientDetails;
}

export function PatientHeroBanner({ details }: PatientHeroBannerProps) {
  const patient = details.patient;
  const chronicList = patient.chronicConditions || [];
  const hasChronic = chronicList.length > 0;
  const firstLetter = patient.fullName?.trim()?.charAt(0) || 'م';
  const fileNumber = patient.id ? `ملف #${patient.id.slice(-6).toUpperCase()}` : '';

  return (
    <div className="bg-[#0A164E] text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-800/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 select-none">
      {/* الجانب الأيمن: الأيقونة الدائرية الصفراء + الاسم والبيانات الأساسية */}
      <div className="flex items-center gap-4">
        {/* الأيقونة الدائرية الصفراء الكبيرة مطابقة للتصميم */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EAB308] text-[#0A164E] flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md">
          {firstLetter}
        </div>

        <div className="space-y-1.5 text-start">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {patient.fullName}
          </h1>

          <div className="text-xs sm:text-sm text-slate-300 font-sans flex items-center gap-2 flex-wrap">
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md text-slate-200">
              {fileNumber}
            </span>
            <span>·</span>
            <span>{patient.age ? `${patient.age} سنة` : ''}</span>
            <span>·</span>
            <span dir="ltr">{patient.phone}</span>
            <span>·</span>
            <span>{patient.gender === 'MALE' ? 'ذكر' : 'أنثى'}</span>
          </div>
        </div>
      </div>

      {/* الجانب الأيسر: بطاقة المرض المزمن إذا كان المريض يعاني من أمراض مزمنة */}
      {hasChronic && (
        <div className="bg-[#EAB308] text-[#0A164E] rounded-2xl p-4 sm:p-4.5 min-w-[180px] shadow-sm shrink-0 border border-yellow-300">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm mb-1 text-[#0A164E]">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            <span>مرض مزمن</span>
          </div>
          <p className="text-xs font-bold text-slate-900 leading-tight">
            {chronicList.join('، ')}
          </p>
        </div>
      )}
    </div>
  );
}


'use client';

import React from 'react';
import { PatientDetails } from '../types/patient';

interface PatientMedicalHistoryCardProps {
  details: PatientDetails;
}

export function PatientMedicalHistoryCard({ details }: PatientMedicalHistoryCardProps) {
  const patient = details.patient;
  const chronicList = patient.chronicConditions || [];
  const hasChronic = chronicList.length > 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs text-start select-none">
      <h3 className="text-base font-black text-[#0A164E] mb-4 pb-3 border-b border-slate-100">
        التاريخ المرضي
      </h3>

      <div className="space-y-4 text-xs font-bold">
        {/* هل يعاني من مرض مزمن */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">هل يعاني من مرض مزمن؟</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black ${
              hasChronic
                ? 'bg-[#0A164E] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {hasChronic ? 'نعم' : 'لا'}
          </span>
        </div>

        {/* قائمة الأمراض المزمنة بالشارات الصفراء */}
        {hasChronic && (
          <div className="flex flex-wrap gap-2 pt-1">
            {chronicList.map((disease, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl bg-[#FEF08A] text-[#854D0E] font-black text-xs shadow-2xs"
              >
                {disease}
              </span>
            ))}
          </div>
        )}

        {/* الأدوية المعتادة */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-slate-400 block mb-1">الأدوية المعتادة:</span>
          <p className="text-slate-700 font-medium leading-relaxed">
            {hasChronic ? 'أدوية الضغط والسكري المنتظمة' : 'لا توجد أدوية مزمنة مسجلة'}
          </p>
        </div>
      </div>
    </div>
  );
}


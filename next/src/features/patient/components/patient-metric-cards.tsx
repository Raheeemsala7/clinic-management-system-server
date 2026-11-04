'use client';

import React from 'react';
import { PatientDetails } from '../types/patient';

interface PatientMetricCardsProps {
  details: PatientDetails;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function PatientMetricCards({ details }: PatientMetricCardsProps) {
  const financial = details.financialSummary || {
    totalCharged: 0,
    totalPaid: 0,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
  };

  const visitCount = details.visitCount || details.previousAppointments?.length || 0;
  const lastVisitDate =
    details.lastVisit?.date ||
    details.previousAppointments?.[0]?.clinicDate ||
    details.previousAppointments?.[0]?.createdAt;

  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const remaining = Number(financial.outstandingBalance || 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {/* 1. عدد الزيارات */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[100px] text-start">
        <span className="text-xs font-bold text-slate-400">عدد الزيارات</span>
        <div className="mt-2 text-2xl sm:text-3xl font-black text-[#0A164E] font-sans">
          {visitCount}
        </div>
      </div>

      {/* 2. آخر زيارة */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[100px] text-start">
        <span className="text-xs font-bold text-slate-400">آخر زيارة</span>
        <div className="mt-2 text-lg sm:text-xl font-black text-[#0A164E] font-mono">
          {formatDate(lastVisitDate)}
        </div>
      </div>

      {/* 3. إجمالي المدفوع */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[100px] text-start">
        <span className="text-xs font-bold text-slate-400">إجمالي المدفوع</span>
        <div className="mt-2 flex items-baseline gap-1 text-[#0A164E]">
          <span className="text-xl sm:text-2xl font-black font-sans">
            {formatMoney(financial.totalPaid)}
          </span>
          <span className="text-xs font-bold text-slate-500">ج.م</span>
        </div>
      </div>

      {/* 4. المتبقي */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[100px] text-start">
        <span className="text-xs font-bold text-slate-400">المتبقي</span>
        <div
          className={`mt-2 flex items-baseline gap-1 ${
            remaining > 0 ? 'text-amber-600' : 'text-emerald-600'
          }`}
        >
          <span className="text-xl sm:text-2xl font-black font-sans">
            {formatMoney(remaining)}
          </span>
          <span className="text-xs font-bold">ج.م</span>
        </div>
      </div>
    </div>
  );
}


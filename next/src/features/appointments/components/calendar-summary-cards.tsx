'use client';

import React from 'react';
import { CalendarSummary } from '../types/calendar';

interface CalendarSummaryCardsProps {
  summary: CalendarSummary;
}

export function CalendarSummaryCards({ summary }: CalendarSummaryCardsProps) {
  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 select-none" dir="rtl">
      {/* 1. مواعيد اليوم (البطاقة الكحلية الأولى في اليمين) */}
      <div className="bg-[#0A164E] text-white rounded-3xl p-5 shadow-xs border border-slate-800/20 flex flex-col justify-between min-h-[105px] transition-all hover:shadow-md text-start">
        <span className="text-xs font-bold text-slate-300">
          مواعيد اليوم
        </span>
        <div className="mt-2 text-2xl sm:text-3xl font-black font-sans tracking-tight">
          {summary.totalToday}
        </div>
      </div>

      {/* 2. المدفوع / العربون (البطاقة الزرقاء الفاتحة) */}
      <div className="bg-[#F0F7FF] text-[#0A164E] rounded-3xl p-5 shadow-2xs border border-blue-100 flex flex-col justify-between min-h-[105px] transition-all hover:shadow-md text-start">
        <span className="text-xs font-bold text-slate-500">
          المدفوع / العربون
        </span>
        <div className="mt-2 flex items-baseline gap-1 text-[#0040D8]">
          <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
            {formatMoney(summary.totalPaid)}
          </span>
          <span className="text-xs font-bold text-slate-500">ج.م</span>
        </div>
      </div>

      {/* 3. المتبقي للتحصيل (البطاقة الصفراء/الكريمية) */}
      <div className="bg-[#FEFCE8] text-[#0A164E] rounded-3xl p-5 shadow-2xs border border-[#FEF08A] flex flex-col justify-between min-h-[105px] transition-all hover:shadow-md text-start">
        <span className="text-xs font-bold text-slate-500">
          المتبقي للتحصيل
        </span>
        <div className="mt-2 flex items-baseline gap-1 text-[#854D0E]">
          <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
            {formatMoney(summary.totalRemaining)}
          </span>
          <span className="text-xs font-bold text-slate-500">ج.م</span>
        </div>
      </div>

      {/* 4. حالات معفية (مجاني) */}
      <div className="bg-white text-[#0A164E] rounded-3xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between min-h-[105px] transition-all hover:shadow-md text-start">
        <span className="text-xs font-bold text-slate-400">
          حالات معفية (مجاني)
        </span>
        <div className="mt-2 text-2xl sm:text-3xl font-black font-sans text-slate-700 tracking-tight">
          {summary.totalExempt}
        </div>
      </div>
    </div>
  );
}


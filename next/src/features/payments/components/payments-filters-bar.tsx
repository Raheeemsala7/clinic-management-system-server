'use client';

import React from 'react';
import { PaymentFilterTab, PaymentsSummaryCounts } from '../types/payments';
import { Search, Calendar, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentsFiltersBarProps {
  currentTab: PaymentFilterTab;
  onTabChange: (tab: PaymentFilterTab) => void;
  counts: PaymentsSummaryCounts;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onExport: () => void;
}

export function PaymentsFiltersBar({
  currentTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  onExport,
}: PaymentsFiltersBarProps) {
  const tabs: Array<{ id: PaymentFilterTab; label: string; count: number }> = [
    { id: 'all', label: 'الكل', count: counts.all },
    { id: 'paid', label: 'تم السداد', count: counts.paid },
    { id: 'deposit', label: 'عربون / جزئي', count: counts.deposit },
    { id: 'remaining', label: 'متبقي للتحصيل', count: counts.remaining },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 select-none">
      {/* 1. ألسنة التبويب للفلترة (Pills/Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'h-10 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none',
                isActive
                  ? 'bg-[#0A164E] text-white shadow-xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-[11px] px-1.5 py-0.2 rounded-md font-sans font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. أدوات البحث واختيار اليوم والتصدير */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* حقل البحث بالاسم أو رقم الهاتف */}
        <div className="relative flex-1 sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث باسم المريض أو الهاتف..."
            className="w-full h-10 pr-9 pl-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0A164E] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* منتقي اليوم المحدد (Date Picker) */}
        <div className="relative shrink-0">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-10 pr-9 pl-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0A164E] focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer font-sans"
          />
          <Calendar className="w-4 h-4 text-blue-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* زر التصدير (Export) */}
        <button
          type="button"
          onClick={onExport}
          title="تصدير كشف المدفوعات"
          className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>تصدير</span>
        </button>
      </div>
    </div>
  );
}


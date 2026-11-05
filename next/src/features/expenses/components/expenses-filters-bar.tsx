'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Tag, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { ExpenseFilterTab, ExpenseCategory } from '../types/expenses';

interface ExpensesFiltersBarProps {
  currentTab: ExpenseFilterTab;
  onTabChange: (tab: ExpenseFilterTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  categories: ExpenseCategory[];
  counts: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

export function ExpensesFiltersBar({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  categories,
  counts,
}: ExpensesFiltersBarProps) {
  const t = useTranslations('Expenses');

  const tabs: { id: ExpenseFilterTab; label: string; count: number }[] = [
    { id: 'all', label: t('all'), count: counts.all },
    { id: 'approved', label: t('approved'), count: counts.approved },
    { id: 'pending', label: t('pending'), count: counts.pending },
    { id: 'rejected', label: t('rejected'), count: counts.rejected },
  ];

  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const formattedMonthLabel = useMemo(() => {
    if (!selectedMonth) return t('viewAll');
    try {
      const [y, m] = selectedMonth.split('-').map(Number);
      const d = new Date(Date.UTC(y, m - 1, 1));
      return d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth, t]);

  const handlePrevMonth = () => {
    const base = selectedMonth || currentMonthStr;
    const [y, m] = base.split('-').map(Number);
    const prevDate = new Date(Date.UTC(y, m - 2, 1));
    const nextY = prevDate.getUTCFullYear();
    const nextM = String(prevDate.getUTCMonth() + 1).padStart(2, '0');
    onMonthChange(`${nextY}-${nextM}`);
  };

  const handleNextMonth = () => {
    const base = selectedMonth || currentMonthStr;
    const [y, m] = base.split('-').map(Number);
    const nextDate = new Date(Date.UTC(y, m, 1));
    const nextY = nextDate.getUTCFullYear();
    const nextM = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
    onMonthChange(`${nextY}-${nextM}`);
  };

  return (
    <div className="space-y-3.5 select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* 1. التبويبات الفئوية لحالة المصروف */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-[#0040D8] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. فلتر الشهر ومنتقي التاريخ المخصص */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="relative flex items-center px-2">
              <Calendar className="w-3.5 h-3.5 text-[#0040D8] ml-1.5 shrink-0 pointer-events-none" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="text-xs font-bold text-[#0A164E] bg-transparent focus:outline-none cursor-pointer font-sans"
              />
              <span className="text-[11px] font-bold text-slate-500 mr-2 hidden sm:inline whitespace-nowrap">
                ({formattedMonthLabel})
              </span>
            </div>

            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* زر التبديل إلى الشهر الحالي أو كل الشهور */}
          {selectedMonth !== currentMonthStr ? (
            <button
              type="button"
              onClick={() => onMonthChange(currentMonthStr)}
              className="px-2.5 py-2 rounded-2xl text-[11px] font-bold text-[#0040D8] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer whitespace-nowrap"
            >
              {t('currentMonth')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMonthChange('')}
              className="px-2.5 py-2 rounded-2xl text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
            >
              {t('viewAll')}
            </button>
          )}
        </div>
      </div>

      {/* 3. شريط البحث واختيار التصنيف */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        {/* اختيار تصنيف المصروف */}
        <div className="relative w-full sm:w-56 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0040D8] cursor-pointer appearance-none shadow-2xs"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* حقل البحث بالوصف أو التصنيف */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-3 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0040D8] shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

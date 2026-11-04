'use client';

import React from 'react';
import { Search, Tag } from 'lucide-react';
import { ExpenseFilterTab, ExpenseCategory } from '../types/expenses';

interface ExpensesFiltersBarProps {
  currentTab: ExpenseFilterTab;
  onTabChange: (tab: ExpenseFilterTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
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
  categories,
  counts,
}: ExpensesFiltersBarProps) {
  const tabs: { id: ExpenseFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: counts.all },
    { id: 'approved', label: 'معتمد', count: counts.approved },
    { id: 'pending', label: 'بانتظار الموافقة', count: counts.pending },
    { id: 'rejected', label: 'مرفوض', count: counts.rejected },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* التبويبات الفئوية */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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

      {/* البحث وفلتر التصنيف */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md">
        {/* اختيار تصنيف المصروف */}
        <div className="relative min-w-[140px]">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0040D8] cursor-pointer appearance-none shadow-2xs"
          >
            <option value="">جميع التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* حقل البحث بالوصف */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث في بيان المصروف..."
            className="w-full pl-3 pr-9 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0040D8] shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}


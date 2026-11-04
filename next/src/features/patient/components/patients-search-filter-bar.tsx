'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Plus, AlertTriangle, Users, Loader2 } from 'lucide-react';
import { PatientFilterType } from '../types/patient';
import { CreatePatientModal } from './create-patient-modal';

interface PatientsSearchFilterBarProps {
  totalCount?: number;
}

export function PatientsSearchFilterBar({ totalCount = 0 }: PatientsSearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get('q') || '';
  const currentFilter = (searchParams.get('filter') as PatientFilterType) || 'all';

  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // تحديث معايير البحث في الرابط بعد انتهاء المستخدم من الكتابة (Debounce 350ms)
  const debouncedSearch = useDebouncedCallback((val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set('q', val.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 350);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    debouncedSearch(val);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleFilterChange = (filter: PatientFilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const filters: Array<{ id: PatientFilterType; label: string; icon?: React.ReactNode }> = [
    { id: 'all', label: 'الكل' },
    {
      id: 'chronic',
      label: 'مرض مزمن',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    },
    { id: 'male', label: 'ذكر' },
    { id: 'female', label: 'أنثى' },
    { id: 'month', label: 'زاروا هذا الشهر' },
  ];

  return (
    <div className="space-y-4 select-none">
      {/* 1. رأس الصفحة: العنوان والعدد وزر إضافة مريض جديد */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A164E] tracking-tight">
              المرضى
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0040D8] text-xs font-black border border-blue-100">
              {totalCount} مريض
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ابحث عن مريض، افتح ملفه، أو عدّل بياناته
          </p>
        </div>

        {/* زر إضافة مريض جديد */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>مريض جديد</span>
        </button>
      </div>

      {/* 2. شريط البحث مع زر بحث */}
      <form onSubmit={handleManualSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="ابحث بالاسم أو رقم الهاتف أو المعرف..."
            className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-[#0A164E] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#0040D8] focus:ring-4 focus:ring-blue-600/10 transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {isPending && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute left-3.5 top-1/2 -translate-y-1/2" />
          )}
        </div>

        <button
          type="submit"
          className="h-11 px-5 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
        >
          بحث
        </button>
      </form>

      {/* 3. رقائق الفلترة (Filter Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFilterChange(f.id)}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
                isActive
                  ? 'bg-[#0A164E] text-white shadow-xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* نافذة تسجيل مريض جديد */}
      <CreatePatientModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}


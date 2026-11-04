import React from 'react';

export function PatientsSearchFilterBarSkeleton() {
  return (
    <div className="space-y-4 select-none animate-pulse" dir="rtl">
      {/* 1. رأس الصفحة: العنوان والزر */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-24 bg-slate-200 rounded-xl" />
            <div className="h-6 w-16 bg-blue-100/70 rounded-full" />
          </div>
          <div className="h-4 w-52 bg-slate-100 rounded-md" />
        </div>

        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* 2. شريط البحث والزر */}
      <div className="flex items-center gap-2">
        <div className="h-11 flex-1 bg-slate-100 rounded-xl border border-slate-200/60" />
        <div className="h-11 w-16 bg-blue-200/60 rounded-xl" />
      </div>

      {/* 3. رقائق الفلترة */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="h-9 w-16 bg-slate-200 rounded-xl" />
        <div className="h-9 w-24 bg-slate-100 rounded-xl border border-slate-200/60" />
        <div className="h-9 w-16 bg-slate-100 rounded-xl border border-slate-200/60" />
        <div className="h-9 w-16 bg-slate-100 rounded-xl border border-slate-200/60" />
        <div className="h-9 w-28 bg-slate-100 rounded-xl border border-slate-200/60" />
      </div>
    </div>
  );
}


import React from 'react';

export function PatientProfileSkeleton() {
  return (
    <div className="space-y-6 select-none animate-pulse" dir="rtl">
      {/* 1. الشريط العلوي */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-blue-100/70 rounded-xl" />
          <div className="h-10 w-32 bg-slate-100 rounded-xl" />
          <div className="h-10 w-20 bg-rose-50 rounded-xl" />
        </div>
        <div className="h-10 w-32 bg-slate-100 rounded-xl" />
      </div>

      {/* 2. بطاقة المريض الرئيسية (Hero Banner) */}
      <div className="bg-[#0A164E]/90 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-400/30 shrink-0" />
          <div className="space-y-2">
            <div className="h-7 w-44 bg-white/20 rounded-lg" />
            <div className="h-4 w-60 bg-white/10 rounded-md" />
          </div>
        </div>
        <div className="w-44 h-16 bg-yellow-400/20 rounded-2xl" />
      </div>

      {/* 3. بطاقات الإحصائيات الأربع */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-7 w-24 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* 4. التقسيم لعمودين */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* العمود الأيمن */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded-md" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3.5 w-20 bg-slate-100 rounded" />
                  <div className="h-3.5 w-28 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="h-5 w-28 bg-slate-200 rounded-md" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-amber-100 rounded-lg" />
              <div className="h-6 w-16 bg-amber-100 rounded-lg" />
            </div>
          </div>
        </div>

        {/* العمود الأيسر */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-4">
            <div className="flex gap-4 border-b border-slate-100 pb-3">
              <div className="h-5 w-20 bg-blue-100 rounded" />
              <div className="h-5 w-20 bg-slate-100 rounded" />
              <div className="h-5 w-20 bg-slate-100 rounded" />
            </div>

            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-50 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-3">
            <div className="h-5 w-40 bg-slate-200 rounded-md" />
            <div className="h-12 bg-slate-50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

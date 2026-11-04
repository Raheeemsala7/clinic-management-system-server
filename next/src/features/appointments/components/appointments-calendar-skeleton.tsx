'use client';

import React from 'react';

export function AppointmentsCalendarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none" dir="rtl">
      {/* 1. هيكل أزرار التحكم العلوية */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="h-10 w-16 bg-slate-200 rounded-xl" />
          <div className="h-10 w-48 bg-slate-200 rounded-xl" />
          <div className="h-10 w-44 bg-slate-200 rounded-xl" />
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          <div className="h-10 w-36 bg-blue-200 rounded-xl" />
        </div>
      </div>

      {/* 2. هيكل بطاقات الإحصائيات الأربعة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="h-28 rounded-3xl bg-slate-200" />
        <div className="h-28 rounded-3xl bg-slate-200" />
        <div className="h-28 rounded-3xl bg-slate-200" />
        <div className="h-28 rounded-3xl bg-slate-200" />
      </div>

      {/* 3. هيكل الفترات والمواعيد */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="h-4 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-36 bg-slate-200 rounded-lg" />
        </div>

        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white rounded-3xl border border-slate-100 p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-8 w-16 bg-slate-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded-lg" />
                <div className="h-3 w-24 bg-slate-100 rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-16 bg-slate-200 rounded-xl" />
              <div className="h-7 w-28 bg-slate-200 rounded-xl" />
              <div className="h-7 w-16 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


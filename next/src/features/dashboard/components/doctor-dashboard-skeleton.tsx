import React from 'react';

/**
 * هيكل التحميل (Skeleton) لشاشة كشف اليوم للطبيب
 * يُعرض فوراً أثناء التنقل الفوري (Instant Navigation) ومرحلة الـ Streaming داخل Suspense
 */
export function DoctorDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-slate-200 rounded-xl" />
          <div className="h-4 w-80 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-9 w-28 bg-slate-100 rounded-xl self-start sm:self-auto" />
      </div>

      {/* صف بطاقات المؤشرات الأربعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* بطاقة 1: حالة الطبيب */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-3">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-slate-100 rounded-xl" />
            <div className="h-9 flex-1 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* بطاقة 2: في الانتظار */}
        <div className="bg-[#FFFDF0] rounded-2xl p-5 border-2 border-brand-yellow/40 space-y-2">
          <div className="h-3 w-20 bg-amber-200/60 rounded mx-auto" />
          <div className="h-8 w-12 bg-amber-200/70 rounded-lg mx-auto" />
        </div>

        {/* بطاقة 3: تم الكشف */}
        <div className="bg-[#F0F5FF] rounded-2xl p-5 border border-blue-200/60 space-y-2">
          <div className="h-3 w-20 bg-blue-200/60 rounded mx-auto" />
          <div className="h-8 w-12 bg-blue-200/70 rounded-lg mx-auto" />
        </div>

        {/* بطاقة 4: إجمالي الحالات */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded mx-auto" />
          <div className="h-8 w-12 bg-slate-200 rounded-lg mx-auto" />
        </div>
      </div>

      {/* القسم الرئيسي: عمود قائمة الانتظار + عمود غرفة الكشف */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[500px]">
        {/* قائمة الانتظار (يمين) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="h-5 w-28 bg-slate-200 rounded-lg" />
            <div className="h-5 w-16 bg-blue-100 rounded-full" />
          </div>

          <div className="h-9 bg-slate-100 rounded-xl" />

          <div className="space-y-3 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-36 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-14 bg-slate-200/70 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* شاشة غرفة الكشف (يسار) */}
        <div className="lg:col-span-7 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100" />
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded" />
          <div className="h-10 w-36 bg-slate-200 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export function TablePatientsSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden select-none animate-pulse" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs">
              <th className="py-4 px-6 text-start">المريض</th>
              <th className="py-4 px-6 text-start">التصنيف</th>
              <th className="py-4 px-6 text-center">آخر زيارة</th>
              <th className="py-4 px-6 text-center">الزيارات</th>
              <th className="py-4 px-6 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index}>
                {/* 1. المريض: دائرة الاسم + الاسم ورقم الهاتف */}
                <td className="py-4 px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-slate-200 rounded-md" />
                      <div className="h-3 w-24 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                </td>

                {/* 2. التصنيف */}
                <td className="py-4 px-6 text-start">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-14 bg-blue-50/60 rounded-lg" />
                    <div className="h-6 w-20 bg-amber-50/60 rounded-lg" />
                  </div>
                </td>

                {/* 3. آخر زيارة */}
                <td className="py-4 px-6 text-center">
                  <div className="h-4 w-20 bg-slate-100 rounded-md mx-auto" />
                </td>

                {/* 4. الزيارات */}
                <td className="py-4 px-6 text-center">
                  <div className="h-5 w-6 bg-slate-200 rounded-md mx-auto" />
                </td>

                {/* 5. الإجراءات */}
                <td className="py-4 px-6 text-end">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="h-8 w-20 bg-blue-100/70 rounded-lg" />
                    <div className="h-8 w-14 bg-slate-100 rounded-lg" />
                    <div className="h-8 w-14 bg-rose-50 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* شريط ترقيم الصفحات (Pagination Skeleton) */}
      <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white">
        <div className="h-4 w-32 bg-slate-100 rounded-md" />
        <div className="flex items-center gap-1.5 justify-center sm:justify-end">
          <div className="w-8 h-8 rounded-lg bg-blue-100/70" />
          <div className="w-8 h-8 rounded-lg bg-slate-100" />
          <div className="w-8 h-8 rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

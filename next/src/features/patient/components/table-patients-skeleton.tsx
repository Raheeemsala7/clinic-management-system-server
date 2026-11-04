import React from 'react';

export function TablePatientsSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
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
              <tr key={index} className="animate-pulse">
                {/* عمود المريض */}
                <td className="py-4 px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-slate-200 rounded-md" />
                      <div className="h-3 w-24 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                </td>

                {/* التصنيف */}
                <td className="py-4 px-6 text-start">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-14 bg-slate-100 rounded-lg" />
                    <div className="h-6 w-20 bg-slate-100 rounded-lg" />
                  </div>
                </td>

                {/* آخر زيارة */}
                <td className="py-4 px-6 text-center">
                  <div className="h-4 w-20 bg-slate-100 rounded-md mx-auto" />
                </td>

                {/* الزيارات */}
                <td className="py-4 px-6 text-center">
                  <div className="h-5 w-6 bg-slate-200 rounded-md mx-auto" />
                </td>

                {/* الإجراءات */}
                <td className="py-4 px-6 text-end">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                    <div className="h-8 w-14 bg-slate-100 rounded-lg" />
                    <div className="h-8 w-14 bg-slate-100 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


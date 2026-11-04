import React from 'react';

/**
 * هيكل التحميل التفاعلي (Skeleton) لجدول قائمة انتظار الاستقبال
 * يُعرض أثناء جلب بيانات مواعيد اليوم داخل Suspense
 */
export function TableAppointmentsSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* رأس الجدول التوضيحي أثناء التحميل */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-3.5 w-64 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-44 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-9 w-24 bg-slate-200/80 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* الجدول */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs">
              <th className="py-4 px-6 text-start">#</th>
              <th className="py-4 px-6 text-start">المريض</th>
              <th className="py-4 px-6 text-start">الطبيب المعالج</th>
              <th className="py-4 px-6 text-center">نوع الكشف</th>
              <th className="py-4 px-6 text-center">الحالة</th>
              <th className="py-4 px-6 text-center">مدة الانتظار</th>
              <th className="py-4 px-6 text-center">الموقف المالي / المتبقي</th>
              <th className="py-4 px-6 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {/* رقم الكشف */}
                <td className="py-4 px-6 text-start">
                  <div className="h-6 w-10 bg-slate-200 rounded-lg" />
                </td>

                {/* المريض */}
                <td className="py-4 px-6 text-start">
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-slate-200 rounded-md" />
                    <div className="h-3 w-20 bg-slate-100 rounded-md" />
                  </div>
                </td>

                {/* الطبيب */}
                <td className="py-4 px-6 text-start">
                  <div className="h-4 w-24 bg-slate-200 rounded-md" />
                </td>

                {/* نوع الكشف */}
                <td className="py-4 px-6 text-center">
                  <div className="h-6 w-16 bg-slate-100 rounded-lg mx-auto" />
                </td>

                {/* الحالة */}
                <td className="py-4 px-6 text-center">
                  <div className="h-6 w-20 bg-slate-100 rounded-full mx-auto" />
                </td>

                {/* مدة الانتظار */}
                <td className="py-4 px-6 text-center">
                  <div className="h-4 w-14 bg-slate-100 rounded-md mx-auto" />
                </td>

                {/* الموقف المالي والمتبقي */}
                <td className="py-4 px-6 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-6 w-24 bg-slate-200/70 rounded-full" />
                    <div className="h-3 w-20 bg-slate-100 rounded-md" />
                  </div>
                </td>

                {/* الإجراءات */}
                <td className="py-4 px-6 text-end">
                  <div className="inline-flex items-center gap-2 justify-end">
                    <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                    <div className="h-8 w-12 bg-slate-100 rounded-lg" />
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


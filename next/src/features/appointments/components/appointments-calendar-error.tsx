'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export interface AppointmentsCalendarErrorProps {
  error?: Error;
  reset?: () => void;
}

export function AppointmentsCalendarError({
  error,
  reset,
}: AppointmentsCalendarErrorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(() => {
      if (reset) {
        reset();
      }
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-xs p-10 text-center" dir="rtl">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
          <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h3 className="text-lg font-black text-[#0A164E] mb-2">
          تعذر تحميل تقويم المواعيد
        </h3>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {error?.message || 'حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مرة أخرى.'}
        </p>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <RotateCcw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          <span>{isPending ? 'جاري التحديث...' : 'إعادة المحاولة'}</span>
        </button>
      </div>
    </div>
  );
}


'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export interface TablePatientsErrorProps {
  error?: Error;
  reset?: () => void;
}

export function TablePatientsError({ error, reset }: TablePatientsErrorProps) {
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
    <div className="bg-white rounded-2xl border border-rose-100 shadow-xs p-8 text-center" dir="rtl">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
          <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h3 className="text-lg font-black text-[#0A164E] mb-2">
          تعذر تحميل سجل المرضى
        </h3>

        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          {error?.message || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم لجلب المرضى'}
        </p>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0040D8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
          <span>إعادة المحاولة الآن</span>
        </button>
      </div>
    </div>
  );
}


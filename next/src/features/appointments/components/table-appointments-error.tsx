'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface TableAppointmentsErrorProps {
  error?: Error;
  reset?: () => void;
}

/**
 * مكون عرض رسالة الخطأ في حالة تعذر جلب قائمة الانتظار
 * يُستخدم مع ErrorBoundary ويوفر زر إعادة المحاولة وتحديث البيانات
 */
export function TableAppointmentsError({ error, reset }: TableAppointmentsErrorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('Dashboard.receptionist.table');

  const handleRetry = () => {
    startTransition(() => {
      if (reset) {
        reset();
      }
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-xs p-8 text-center">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* أيقونة التنبيه */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
          <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* عنوان الخطأ */}
        <h3 className="text-lg font-black text-[#0A164E] mb-2">
          {t('errorTitle')}
        </h3>

        {/* وصف توضيحي */}
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          {error?.message || t('errorMessage')}
        </p>

        {/* زر إعادة المحاولة */}
        <button
          type="button"
          onClick={handleRetry}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <RotateCcw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          <span>{isPending ? 'جاري التحديث...' : t('retry')}</span>
        </button>
      </div>
    </div>
  );
}


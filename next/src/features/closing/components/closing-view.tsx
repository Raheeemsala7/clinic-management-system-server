'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useClosingPreviewQuery } from '../hooks/closing.hook';
import { ClosingKpiCards } from './closing-kpi-cards';
import { ClosingPreviewCard } from './closing-preview-card';
import { ClosingFormCard } from './closing-form-card';
import { RotateCcw, Loader2 } from 'lucide-react';

export function ClosingView() {
  const t = useTranslations('Closing');
  const { data: preview, isLoading, isFetching, refetch } = useClosingPreviewQuery();

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A164E] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-3 self-start sm:self-auto rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs active:scale-95"
          title="تحديث بيانات الإغلاق"
        >
          <RotateCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-[#0040D8] animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-bold">جاري تحميل بيانات ومعاينة الإغلاق...</p>
        </div>
      ) : (
        <>
          {/* 2. بطاقات المؤشرات الأربعة العلوية */}
          <ClosingKpiCards preview={preview} />

          {/* 3. العمودين السفليين: إغلاق الصندوق (يسار) ومعاينة الإغلاق (يمين) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* في RTL: العمود الأول يظهر يميناً (المعاينة) والثاني يساراً (النموذج) */}
            <div className="order-2 lg:order-1">
              <ClosingFormCard preview={preview} />
            </div>

            <div className="order-1 lg:order-2">
              <ClosingPreviewCard preview={preview} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

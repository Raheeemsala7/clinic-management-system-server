'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ClosingPreview } from '../types/closing';
import { AlertTriangle } from 'lucide-react';

interface ClosingPreviewCardProps {
  preview?: ClosingPreview;
}

export function ClosingPreviewCard({ preview }: ClosingPreviewCardProps) {
  const t = useTranslations('Closing');
  const totalCashPayments = Number(preview?.totalCashPayments ?? 0);
  const totalApprovedExpenses = Number(preview?.totalApprovedExpenses ?? 0);
  const expectedCash = Number(preview?.expectedCash ?? 0);
  const totalPendingExpenses = Number(preview?.totalPendingExpenses ?? 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, ' / ');
  };

  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
      {/* 1. رأس البطاقة الكحلي الداكن */}
      <div className="bg-[#0A164E] text-white px-6 py-4 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight">{t('previewTitle')}</h3>
        <span className="text-xs font-mono font-bold text-slate-300">
          {formatDate(preview?.clinicDate)}
        </span>
      </div>

      {/* 2. تفاصيل المعاينة المالية */}
      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* إجمالي المدفوعات النقدية */}
          <div className="flex items-center justify-between text-sm py-1 border-b border-slate-50">
            <span className="font-bold text-slate-600">{t('totalCash')}</span>
            <div className="font-black text-emerald-600 font-sans text-base">
              + {formatMoney(totalCashPayments)}{' '}
              <span className="text-xs font-bold text-emerald-700/80">{t('currency')}</span>
            </div>
          </div>

          {/* إجمالي المصروفات المعتمدة */}
          <div className="flex items-center justify-between text-sm py-1 border-b border-slate-50">
            <span className="font-bold text-slate-600">{t('totalExpenses')}</span>
            <div className="font-black text-rose-600 font-sans text-base">
              - {formatMoney(totalApprovedExpenses)}{' '}
              <span className="text-xs font-bold text-rose-700/80">{t('currency')}</span>
            </div>
          </div>
        </div>

        {/* 3. الصندوق الأزرق الكبير: النقد المتوقع في الصندوق */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm sm:text-base font-black text-[#0A164E]">
            {t('expectedCash')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#0040D8] font-sans">
            {formatMoney(expectedCash)}{' '}
            <span className="text-xs font-bold text-slate-500 font-sans">{t('currency')}</span>
          </div>
        </div>

        {/* 4. تنبيه المصروفات المعلقة */}
        {totalPendingExpenses > 0 && (
          <div className="bg-[#FFFDE7] border border-amber-300/80 rounded-2xl p-4 text-xs font-bold text-amber-900 flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('pendingWarning', { amount: formatMoney(totalPendingExpenses) })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

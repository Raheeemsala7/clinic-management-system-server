'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ClosingPreview } from '../types/closing';

interface ClosingKpiCardsProps {
  preview?: ClosingPreview;
}

export function ClosingKpiCards({ preview }: ClosingKpiCardsProps) {
  const t = useTranslations('Closing');
  const paymentsCount = preview?.paymentsCount ?? 0;
  const totalCashPayments = Number(preview?.totalCashPayments ?? 0);
  const totalApprovedExpenses = Number(preview?.totalApprovedExpenses ?? 0);
  const totalPendingExpenses = Number(preview?.totalPendingExpenses ?? 0);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. عدد المدفوعات */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
        <span className="text-xs font-bold text-slate-500">
          {t('paymentCount')}
        </span>
        <div className="mt-3 text-2xl sm:text-3xl font-black text-[#0A164E] font-sans">
          {formatNumber(paymentsCount)}
        </div>
      </div>

      {/* 2. المدفوع نقداً */}
      <div className="bg-blue-50/60 rounded-2xl border border-blue-100/80 p-5 shadow-xs flex flex-col justify-between">
        <span className="text-xs font-bold text-slate-600">
          {t('paidInCash')}
        </span>
        <div className="mt-3 flex items-baseline gap-1.5 text-2xl sm:text-3xl font-black text-[#0040D8] font-sans">
          <span>{formatNumber(totalCashPayments)}</span>
          <span className="text-xs font-bold text-slate-500 font-sans">{t('currency')}</span>
        </div>
      </div>

      {/* 3. مصروفات معتمدة */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
        <span className="text-xs font-bold text-slate-500">
          {t('approvedExpenses')}
        </span>
        <div className="mt-3 flex items-baseline gap-1.5 text-2xl sm:text-3xl font-black text-[#0A164E] font-sans">
          <span>{formatNumber(totalApprovedExpenses)}</span>
          <span className="text-xs font-bold text-slate-500 font-sans">{t('currency')}</span>
        </div>
      </div>

      {/* 4. مصروفات معلّقة (بطاقة صفراء مميزة) */}
      <div className="bg-[#FFFDE7]/80 rounded-2xl border border-amber-200/90 p-5 shadow-xs flex flex-col justify-between">
        <span className="text-xs font-bold text-amber-800">
          {t('pendingExpenses')}
        </span>
        <div className="mt-3 flex items-baseline gap-1.5 text-2xl sm:text-3xl font-black text-amber-600 font-sans">
          <span>{formatNumber(totalPendingExpenses)}</span>
          <span className="text-xs font-bold text-amber-700/80 font-sans">{t('currency')}</span>
        </div>
      </div>
    </div>
  );
}

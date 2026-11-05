'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExpenseBudgetStatus } from '../types/expenses';
import { ShieldCheck, AlertTriangle, TrendingUp, Sparkles, Settings2, Clock, CheckCircle2 } from 'lucide-react';
import { UpdateBudgetModal } from './update-budget-modal';

interface ExpensesBudgetCardProps {
  budget?: ExpenseBudgetStatus;
  isAdmin?: boolean;
}

export function ExpensesBudgetCard({ budget, isAdmin }: ExpensesBudgetCardProps) {
  const t = useTranslations('Expenses');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const monthlyLimit = Number(budget?.monthlyLimit || 1000);
  const totalApproved = Number(budget?.totalApprovedSpent || 0);
  const remaining = Number(budget?.remainingBudget ?? Math.max(0, monthlyLimit - totalApproved));
  const pendingAmount = Number(budget?.totalPendingSpent || 0);
  const usagePercentage = Number(budget?.usagePercentage || 0);
  const isExceeded = budget?.isExceeded ?? (totalApproved >= monthlyLimit);

  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        {/* شريط الإضاءة العلوي */}
        <div
          className={`absolute top-0 right-0 left-0 h-1.5 transition-all ${
            isExceeded
              ? 'bg-amber-500'
              : usagePercentage > 80
              ? 'bg-amber-400'
              : 'bg-[#0040D8]'
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* الجانب الأيمن: العنوان والملخص التوضيحي */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0040D8] shadow-2xs">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#0A164E] tracking-tight">
                  {t('budgetTitle')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('budgetSubtitle')}
                </p>
              </div>

              {/* شارة حالة الميزانية */}
              <div className="mr-auto sm:mr-0">
                {!isExceeded ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('autoApprovedAvailable')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('budgetExceeded')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* شريط التقدم المالي */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-500">
                  {t('usagePercentage')}: <span className="font-mono text-[#0A164E]">{usagePercentage}%</span>
                </span>
                <span className="text-slate-400">
                  {t('budgetMonth')}: <span className="font-mono text-slate-700">{budget?.month || 'Current'}</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExceeded
                      ? 'bg-amber-500'
                      : usagePercentage > 80
                      ? 'bg-amber-500'
                      : 'bg-[#0040D8]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, usagePercentage))}%` }}
                />
              </div>
            </div>
          </div>

          {/* الجانب الأيسر: بطاقات الأرقام المالية وزر تعديل السقف للإدارة */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* 1. السقف الشهري المحدد */}
            <div className="flex-1 sm:flex-initial p-4 rounded-2xl bg-slate-50/80 border border-slate-100 min-w-[130px] text-center">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                {t('monthlyBudget')}
              </span>
              <div className="text-base sm:text-lg font-black text-[#0A164E] font-sans">
                {formatMoney(monthlyLimit)}{' '}
                <span className="text-xs text-slate-400 font-bold">{t('currency')}</span>
              </div>
            </div>

            {/* 2. المنصرف المعتمد فعلياً */}
            <div className="flex-1 sm:flex-initial p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 min-w-[130px] text-center">
              <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                {t('approvedSpent')}
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-800 font-sans">
                {formatMoney(totalApproved)}{' '}
                <span className="text-xs text-emerald-600 font-bold">{t('currency')}</span>
              </div>
            </div>

            {/* 3. المتبقي للصرف بدون موافقة */}
            <div className="flex-1 sm:flex-initial p-4 rounded-2xl bg-blue-50/50 border border-blue-100 min-w-[140px] text-center">
              <span className="text-[11px] font-bold text-[#0040D8] block mb-1">
                {t('remainingBudget')}
              </span>
              <div className="text-base sm:text-lg font-black text-[#0040D8] font-sans">
                {formatMoney(remaining)}{' '}
                <span className="text-xs text-blue-600 font-bold">{t('currency')}</span>
              </div>
            </div>

            {/* 4. المعلق بانتظار الاعتماد (إن وُجد) */}
            {pendingAmount > 0 && (
              <div className="flex-1 sm:flex-initial p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 min-w-[130px] text-center animate-pulse">
                <span className="text-[11px] font-bold text-amber-800 block mb-1 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{t('pendingApprovals')}</span>
                </span>
                <div className="text-base sm:text-lg font-black text-amber-900 font-sans">
                  {formatMoney(pendingAmount)}{' '}
                  <span className="text-xs text-amber-700 font-bold">{t('currency')}</span>
                </div>
              </div>
            )}

            {/* زر تعديل الحد الشهري للأدمن */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto p-3.5 rounded-2xl border border-slate-200 hover:border-[#0040D8] hover:bg-blue-50/50 text-slate-700 hover:text-[#0040D8] transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 shadow-2xs"
                title={t('editLimit')}
              >
                <Settings2 className="w-4 h-4" />
                <span className="sm:hidden lg:inline">{t('editLimit')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <UpdateBudgetModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentLimit={monthlyLimit}
        />
      )}
    </>
  );
}

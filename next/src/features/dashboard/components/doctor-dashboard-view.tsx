'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * المحتوى الخاص بشاشة كشف اليوم للطبيب (Doctor Dashboard) - مترجم بالكامل عبر next-intl
 */
export const DoctorDashboardView = () => {
  const t = useTranslations('Dashboard.doctor');
  const tDoctorStatus = useTranslations('Dashboard.doctorStatus');

  const [activeTab, setActiveTab] = useState<'waiting' | 'done' | 'all'>('waiting');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="text-start">
        <h2 className="text-3xl font-black text-[#0A164E] tracking-tight">
          {t('title')}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* صف بطاقات المتابعة والحالة الأربعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* بطاقة حالة الطبيب */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 mb-3 text-start">
            {tDoctorStatus('title')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAvailable(true)}
              className={cn(
                'flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                isAvailable
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>{tDoctorStatus('available')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAvailable(false)}
              className={cn(
                'flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center border cursor-pointer',
                !isAvailable
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {tDoctorStatus('takeBreak')}
            </button>
          </div>
        </div>

        {/* بطاقة في الانتظار (إطار أصفر) */}
        <div className="bg-[#FFFDF0] rounded-2xl p-5 shadow-xs border-2 border-brand-yellow flex flex-col justify-between text-center">
          <span className="text-xs font-semibold text-slate-500">
            {t('waitingStatus')}
          </span>
          <div className="flex items-baseline justify-center gap-2 my-1">
            <span className="text-3xl font-black text-[#0A164E]">0</span>
            <span className="text-xs font-bold text-slate-500">{t('remainingCases')}</span>
          </div>
        </div>

        {/* بطاقة تم الكشف (إطار أزرق فاتح) */}
        <div className="bg-[#F0F5FF] rounded-2xl p-5 shadow-xs border border-blue-200 flex flex-col justify-between text-center">
          <span className="text-xs font-semibold text-slate-500">
            {t('completedCheckup')}
          </span>
          <div className="flex items-baseline justify-center gap-2 my-1">
            <span className="text-3xl font-black text-[#0A164E]">0</span>
            <span className="text-xs font-bold text-slate-500">{t('doneCheckup')}</span>
          </div>
        </div>

        {/* بطاقة إجمالي الحالات اليوم */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between text-center">
          <span className="text-xs font-semibold text-slate-400">
            {t('totalCases')}
          </span>
          <div className="flex items-baseline justify-center gap-2 my-1">
            <span className="text-3xl font-black text-[#0A164E]">0</span>
            <span className="text-xs font-bold text-slate-500">{t('registeredAppointments')}</span>
          </div>
        </div>
      </div>

      {/* القسم الرئيسي ذو العمودين: قائمة الانتظار + شاشة الكشف الكبرى */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[420px]">
        {/* العمود الأيمن (في RTL): قائمة الانتظار */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-base text-[#0A164E]">
                {t('queueTitle')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] text-xs font-bold">
                {t('totalBadge', { count: 0 })}
              </span>
            </div>

            {/* أزرار التصفية الثلاثية */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('waiting')}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'waiting'
                    ? 'bg-[#0A164E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t('tabs.waiting')} (0)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('done')}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'done'
                    ? 'bg-[#0A164E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t('tabs.done')} (0)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'all'
                    ? 'bg-[#0A164E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t('tabs.all')} (0)
              </button>
            </div>
          </div>

          {/* نص الحالة الفارغة */}
          <div className="py-16 text-center text-slate-400 text-sm font-semibold">
            {t('emptyQueue')}
          </div>
        </div>

        {/* العمود الأيسر (في RTL): شاشة غرفة الكشف بحواف متقطعة */}
        <div className="lg:col-span-8 bg-white border-2 border-dashed border-blue-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xs">
          {/* أيقونة الشعار داخل بطاقة زرقاء داكنة */}
          <div className="w-16 h-16 rounded-2xl bg-[#0A164E] flex items-center justify-center mb-5 shadow-md">
            <div className="grid grid-cols-2 gap-1 w-7 h-7" aria-hidden="true">
              <span className="w-3 h-3 rounded-xs bg-[#1D4ED8]" />
              <span className="w-3 h-3 rounded-xs bg-white" />
              <span className="w-3 h-3 rounded-xs bg-[#081544]" />
              <span className="w-3 h-3 rounded-xs bg-brand-yellow" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-[#0A164E] mb-2 tracking-tight">
            {t('emptyRoomTitle')}
          </h3>
          <p className="text-sm text-slate-400">
            {t('emptyRoomSubtitle')}
          </p>
        </div>
      </div>
    </div>
  );
};

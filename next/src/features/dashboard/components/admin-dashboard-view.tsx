'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * المحتوى الخاص بلوحة تحكم المدير (Admin Dashboard) - مترجم بالكامل عبر next-intl
 */
export const AdminDashboardView = () => {
  const t = useTranslations('Dashboard.admin');
  const tNav = useTranslations('Dashboard.nav');

  const stats = [
    { title: t('stats.revenue'), value: `0.00 ${t('stats.currency')}`, border: 'border-t-4 border-[#1D4ED8]' },
    { title: t('stats.expenses'), value: `0.00 ${t('stats.currency')}`, border: 'border-t-4 border-[#F5B800]' },
    { title: t('stats.netProfit'), value: `0.00 ${t('stats.currency')}`, border: 'border-t-4 border-[#0A164E]' },
    { title: t('stats.visits'), value: '0', border: 'border-t-4 border-[#0A164E]' },
    { title: t('stats.averageVisit'), value: `0.00 ${t('stats.currency')}`, border: 'border-t-4 border-[#1D4ED8]' },
  ];

  const quickActions = [
    { title: tNav('payments'), href: '/dashboard/payments', iconBg: 'bg-[#081544]' },
    { title: tNav('expenses'), href: '/dashboard/expenses', iconBg: 'bg-[#1D4ED8]' },
    { title: tNav('closing'), href: '/dashboard/closing', iconBg: 'bg-[#F5B800]' },
    { title: tNav('reports'), href: '/dashboard/reports', iconBg: 'bg-[#081544]' },
    { title: tNav('users'), href: '/dashboard/users', iconBg: 'bg-[#1D4ED8]' },
    { title: tNav('settings'), href: '/dashboard/settings', iconBg: 'bg-[#F5B800]' },
    { title: tNav('audit'), href: '/dashboard/audit', iconBg: 'bg-[#081544]' },
    { title: tNav('patients'), href: '/dashboard/patients', iconBg: 'bg-[#1D4ED8]' },
  ];

  const chartBars = [
    { height: '40%', color: 'bg-[#0040D8]' },
    { height: '90%', color: 'bg-brand-yellow' },
    { height: '50%', color: 'bg-[#0040D8]' },
    { height: '75%', color: 'bg-[#0040D8]' },
    { height: '30%', color: 'bg-[#0040D8]' },
    { height: '65%', color: 'bg-[#0040D8]' },
    { height: '45%', color: 'bg-[#0040D8]' },
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة + فلتر التاريخ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black text-[#0A164E] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>

        <div className="inline-flex items-center self-start sm:self-auto px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          {t('dateRange')}
        </div>
      </div>

      {/* صف بطاقات الإحصائيات الخمسة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              'bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between text-center transition-all hover:shadow-md',
              stat.border
            )}
          >
            <span className="text-xs font-semibold text-slate-400 mb-2">
              {stat.title}
            </span>
            <span className="text-lg sm:text-2xl font-black text-[#0A164E] tracking-tight">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* شبكة الإجراءات السريعة (8 بطاقات في صفين) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {quickActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all group"
          >
            <span className="font-bold text-sm text-[#0A164E] group-hover:text-[#1D4ED8] transition-colors">
              {action.title}
            </span>
            <span
              className={cn(
                'w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0 transition-transform group-hover:scale-105',
                action.iconBg
              )}
            />
          </Link>
        ))}
      </div>

      {/* كارت الرسم البياني التوضيحي للإيرادات */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-100">
        <h3 className="text-sm font-bold text-[#0A164E] mb-6 text-start">
          {t('weeklyRevenue')}
        </h3>

        {/* أعمدة الرسم البياني */}
        <div className="h-44 sm:h-52 w-full flex items-end justify-between gap-3 sm:gap-6 pt-4 border-b border-slate-200">
          {chartBars.map((bar, i) => (
            <div
              key={i}
              className="flex-1 flex items-end justify-center h-full"
            >
              <div
                style={{ height: bar.height }}
                className={cn('w-full rounded-t-xl transition-all duration-300 hover:opacity-90', bar.color)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

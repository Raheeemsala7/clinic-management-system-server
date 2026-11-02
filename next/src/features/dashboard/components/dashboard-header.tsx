'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { AuthLanguageBtn } from '@/features/auth/components/auth-language-btn';
import { DashboardNotifications } from './dashboard-notifications';
import { DashboardSignOutBtn } from './dashboard-sign-out-btn';
import { UserRole } from '../types';
import { ROLE_CONFIG } from '../constants';

interface DashboardHeaderProps {
  role: UserRole;
}

/**
 * شريط الرأس الموحد للوحة التحكم - مترجم بالكامل عبر next-intl
 * يتضمن الترحيب بالدور الحالي، شارة حالة الطبيب، زر تغيير اللغة المتجاوب،
 * قائمة الإشعارات التفاعلية مع شارة العداد، وزر تسجيل الخروج
 */
export function DashboardHeader({ role }: DashboardHeaderProps) {
  const t = useTranslations('Dashboard');
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 py-3.5 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
      {/* الجانب الأيمن (في RTL): زر فتح/طي الـ Sidebar + الترحيب بالدور */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="text-[#0A164E] hover:bg-slate-100 rounded-xl shrink-0" />

        <h1 className="text-xs sm:text-base font-black text-[#0A164E] tracking-tight truncate">
          {t(config.greetingKey)}
        </h1>
      </div>

      {/* الجانب الأيسر (في RTL): حالة الطبيب + زر اللغة المتجاوب + زر الإشعارات + زر الخروج */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* شارة حالة الطبيب (تظهر للطبيب والاستقبال) */}
        {config.showDoctorStatus && (
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A] text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{t('doctorStatus.available')}</span>
          </div>
        )}

        {/* زر تبديل اللغة (على الموبايل: أيقونة الكوكب + EN/AR، وعلى الديسكتوب: الزر كاملاً) */}
        <AuthLanguageBtn className="inline-flex" />

        {/* قائمة الإشعارات التفاعلية مع شارة عدد الإشعارات */}
        <DashboardNotifications />

        {/* زر تسجيل الخروج من لوحة التحكم */}
        <DashboardSignOutBtn />
      </div>
    </header>
  );
}

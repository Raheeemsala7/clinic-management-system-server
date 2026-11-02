'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { AuthLanguageBtn } from '@/features/auth/components/auth-language-btn';
import { UserRole } from '../types';
import { ROLE_CONFIG } from '../constants';

interface DashboardHeaderProps {
  role: UserRole;
  onOpenMobileSidebar?: () => void;
}

/**
 * شريط الرأس الموحد للوحة التحكم - يتضمن الترحيب، حالة الطبيب، زر اللغة، وزر التنبيهات
 */
export const DashboardHeader = ({
  role,
  onOpenMobileSidebar,
}: DashboardHeaderProps) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;

  return (
    <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-100 py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* الجانب الأيمن (في RTL): زر الموبايل + جملة الترحيب */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm sm:text-base font-black text-[#0A164E] tracking-tight">
          {config.greeting}
        </h1>
      </div>

      {/* الجانب الأيسر (في RTL): حالة الطبيب + زر اللغة + زر التنبيه */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* شارة حالة الطبيب (تظهر للطبيب والاستقبال كما في الصورة) */}
        {config.showDoctorStatus && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A] text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>طبيب: متاح</span>
          </div>
        )}

        {/* زر تبديل اللغة ⇄ ENGLISH */}
        <AuthLanguageBtn className="hidden sm:inline-flex" />

        {/* زر التنبيه الدائري الكحلي مع علامة التعجب الصفراء */}
        <button
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0A164E] text-[#F5B800] flex items-center justify-center font-black text-sm shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="التنبيهات"
          title="التنبيهات"
        >
          !
        </button>
      </div>
    </header>
  );
};

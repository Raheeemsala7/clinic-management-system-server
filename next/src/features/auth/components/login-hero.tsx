'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * الجانب الإبداعي لصفحة تسجيل الدخول (Hero) - مطابق تماماً للصورة
 * يحتوي على شعار ENT Clinic، عنوان نظام إدارة العيادة، والأشكال الهندسية المتداخلة
 */
export  function LoginHero () {
  const t = useTranslations('Auth.login');

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-screen bg-gradient-to-br from-[#08143D] via-[#0A164E] to-[#060F2E] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden select-none">
      {/* إضاءات جمالية متوهجة في الخلفية تحاكي الصورة بدقة */}
      <div
        className="absolute top-1/3 -right-16 w-96 h-96 bg-blue-600/35 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -left-16 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* الشريط العلوي: شعار ENT Clinic مع المربعات الأربعة في الزاوية العلوية */}
      <div className="relative z-10 flex items-center justify-end w-full">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-white text-base sm:text-lg tracking-tight font-sans">
            {t('brandTitle')}
          </span>
          <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-white" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#081544]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#F5B800]" />
          </div>
        </div>
      </div>

      {/* المحتوى الأوسط: العنوان العريض والنص التوضيحي */}
      <div className="relative z-10 my-auto py-12 text-start max-w-lg">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
          {t('heroTitleLine1')}
          <br />
          {t('heroTitleLine2')}
        </h1>
        <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-md">
          {t('heroDesc')}
        </p>
      </div>

      {/* الأشكال الهندسية المتداخلة باللون الأصفر والأزرق في الأسفل - مطابقة للصورة تماماً */}
      <div className="relative z-0 h-44 sm:h-52 w-full pointer-events-none">
        <div className="absolute -bottom-8 left-6 sm:left-12 flex items-end">
          {/* المربع الأصفر الكبير ذو الزوايا المنحنية */}
          <div
            className="w-44 h-44 sm:w-56 sm:h-56 bg-[#F5B800] rounded-[36px] shadow-2xl relative z-10"
            aria-hidden="true"
          />

          {/* المربع الأزرق الزاهي المتداخل معه */}
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 bg-[#0040D8] rounded-[28px] -ml-14 sm:-ml-16 -mb-8 relative z-20 shadow-2xl"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};


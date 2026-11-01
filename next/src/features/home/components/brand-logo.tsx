'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { cn } from 'cn';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

/**
 * شعار العيادة المكون من 4 مربعات منحنية الزوايا
 * على شاشات الموبايل يتم إخفاء اسم الدكتور تلقائياً للحفاظ على المساحة وجمالية الهيدر
 */
export const BrandLogo = ({
  variant = 'light',
  showText = true,
  className,
}: BrandLogoProps) => {
  const isLight = variant === 'light';
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const doctorName = isArabic ? 'د. إسلام عبدالله كريمة' : 'Dr. Eslam Kareema';

  return (
    <Link
      href="#hero"
      className={cn(
        'inline-flex items-center gap-2 group select-none transition-transform hover:opacity-95 shrink-0',
        className
      )}
      aria-label={doctorName}
    >
      {/* أيقونة الشعار (4 مربعات هندسية بألوان العيادة) */}
      <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8]" />
        <span
          className={cn(
            'w-2.5 h-2.5 rounded-xs transition-colors',
            isLight ? 'bg-white' : 'bg-[#0A164E]'
          )}
        />
        <span
          className={cn(
            'w-2.5 h-2.5 rounded-xs transition-colors',
            isLight ? 'bg-[#081544]' : 'bg-[#0A164E]'
          )}
        />
        <span className="w-2.5 h-2.5 rounded-xs bg-[#F5B800]" />
      </div>

      {/* اسم الطبيب: مخفي على الموبايل الصغير ومفعل على الشاشات المتوسطة والأكبر */}
      {showText && (
        <span
          className={cn(
            'hidden sm:inline-block font-bold text-base md:text-lg tracking-tight font-sans transition-colors whitespace-nowrap',
            isLight ? 'text-white' : 'text-[#0A164E]'
          )}
        >
          {doctorName}
        </span>
      )}
    </Link>
  );
};

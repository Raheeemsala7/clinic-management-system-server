'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from 'cn';

interface BrandLogoProps {
  /**
   * نمط اللوجو:
   * 'light': للخلفيات الداكنة كالهيدر (مربعات زرقاء، بيضاء، كحلية، وصفراء مع نص أبيض)
   * 'dark': للخلفيات الفاتحة (مربعات زرقاء، كحلية، وصفراء مع نص كحلي)
   */
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

/**
 * شعار العيادة المكون من 4 مربعات منحنية الزوايا مع اسم الطبيب
 */
export const BrandLogo = ({
  variant = 'light',
  showText = true,
  className,
}: BrandLogoProps) => {
  const isLight = variant === 'light';

  return (
    <Link
      href="#hero"
      className={cn(
        'inline-flex items-center gap-2.5 group select-none transition-transform hover:opacity-95',
        className
      )}
      aria-label="د. إسلام عبدالله كريمة - عيادة الأنف والأذن والحنجرة"
    >
      {/* أيقونة الشعار (4 مربعات منحنية) */}
      <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0" aria-hidden="true">
        {/* أعلى يمين / أعلى يسار حسب الاتجاه */}
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

      {/* اسم الطبيب واللقب */}
      {showText && (
        <span
          className={cn(
            'font-bold text-lg tracking-tight font-sans transition-colors',
            isLight ? 'text-white' : 'text-[#0A164E]'
          )}
        >
          د. إسلام عبدالله كريمة
        </span>
      )}
    </Link>
  );
};


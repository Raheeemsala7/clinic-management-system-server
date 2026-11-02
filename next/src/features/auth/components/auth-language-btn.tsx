'use client';

import React, { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { setLocale } from '@/i18n/actions';
import { useRouter } from 'next/navigation';
import { Globe, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthLanguageBtnProps {
  className?: string;
}

/**
 * زر تبديل اللغة المتجاوب:
 * - على الشاشات الكبيرة: ⇄ ENGLISH / العربية
 * - على الموبايل: أيقونة الكوكب + أول حرفين من اللغة (EN / AR) لتوفير المساحة
 */
export function AuthLanguageBtn({ className }: AuthLanguageBtnProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isArabic = locale === 'ar';
  const targetLocale = isArabic ? 'en' : 'ar';
  const label = isArabic ? 'ENGLISH' : 'العربية';
  const shortLabel = targetLocale.toUpperCase(); // EN أو AR

  const handleToggle = () => {
    startTransition(async () => {
      await setLocale(targetLocale);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isArabic ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
      title={isArabic ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
      className={cn(
        'inline-flex items-center gap-1.5 sm:gap-2 border border-slate-300/80 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 active:scale-95 transition-all select-none cursor-pointer shadow-2xs',
        isPending && 'opacity-60 pointer-events-none',
        className
      )}
    >
      {/* أيقونة الكوكب للشاشات الصغيرة */}
      <Globe className="w-3.5 h-3.5 text-slate-700 sm:hidden shrink-0" />

      {/* أيقونة التبديل للشاشات الكبيرة */}
      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-700 hidden sm:inline-block shrink-0" />

      {/* أول حرفين للغة على الموبايل لتوفير المساحة */}
      <span className="sm:hidden font-black text-[11px] tracking-wider">
        {shortLabel}
      </span>

      {/* الاسم الكامل للغة على الشاشات العادية والكبيرة */}
      <span className="hidden sm:inline font-bold">
        {label}
      </span>
    </button>
  );
}

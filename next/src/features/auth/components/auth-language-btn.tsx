'use client';

import React, { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { setLocale } from '@/i18n/actions';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from 'cn';

interface AuthLanguageBtnProps {
  className?: string;
}

/**
 * زر تبديل اللغة المخصص لصفحة تسجيل الدخول مطابقة للتصميم ⇄ ENGLISH
 */
export const AuthLanguageBtn = ({ className }: AuthLanguageBtnProps) => {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isArabic = locale === 'ar';
  const targetLocale = isArabic ? 'en' : 'ar';
  const label = isArabic ? 'ENGLISH' : 'العربية';

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
      className={cn(
        'inline-flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 active:scale-95 transition-all select-none cursor-pointer shadow-2xs',
        isPending && 'opacity-60 pointer-events-none',
        className
      )}
    >
      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-700" />
      <span>{label}</span>
    </button>
  );
};


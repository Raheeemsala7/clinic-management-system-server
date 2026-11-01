'use client';

import React, { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { setLocale } from '@/i18n/actions';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { cn } from 'cn';

interface SwitchLanguageBtnProps {
  className?: string;
  variant?: 'light' | 'dark';
}

/**
 * زر تبديل اللغة الأنيق (عربي / إنجليزي) بدون تغيير الـ URL
 */
export function SwitchLanguageBtn({
  className,
  variant = 'light',
}: SwitchLanguageBtnProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isArabic = locale === 'ar';
  const targetLocale = isArabic ? 'en' : 'ar';
  const label = isArabic ? 'English' : 'العربية';

  const handleToggle = () => {
    startTransition(async () => {
      await setLocale(targetLocale);
      router.refresh();
    });
  };

  const isLight = variant === 'light';

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isArabic ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none cursor-pointer',
        isPending && 'opacity-60 pointer-events-none',
        isLight
          ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15'
          : 'text-[#0A164E] bg-slate-100 hover:bg-slate-200 border border-slate-200',
        className
      )}
    >
      <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span>{label}</span>
    </button>
  );
}

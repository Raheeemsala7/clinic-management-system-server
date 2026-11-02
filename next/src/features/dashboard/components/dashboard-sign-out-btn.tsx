'use client';

import React, { useTransition } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DashboardSignOutBtnProps {
  className?: string;
}

/**
 * زر تسجيل الخروج الأنيق لشريط رأس لوحة التحكم مترجم عبر next-intl
 */
export function DashboardSignOutBtn({ className }: DashboardSignOutBtnProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('Dashboard');

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({
        callbackUrl: '/auth/login',
      });
    });
  };

  const title = t('signOut');

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(
        'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200/80 transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      aria-label={title}
      title={title}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </button>
  );
}

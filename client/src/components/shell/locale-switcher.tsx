'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { setLocaleAction } from '@/features/locale/actions';

interface LocaleSwitcherProps {
  currentLocale: 'en' | 'ar';
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextLocale = currentLocale === 'en' ? 'ar' : 'en';
    startTransition(async () => {
      await setLocaleAction(nextLocale);
      // Hard refresh so all server and client components reload with the new locale & direction
      window.location.reload();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-1.5 h-9 px-2.5 text-xs font-semibold rounded-lg border-muted-foreground/20 hover:bg-primary/5 hover:border-primary/40 transition-all shadow-2xs"
      title={currentLocale === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin text-primary" />
      ) : (
        <Languages className="size-3.5 text-primary" />
      )}
      <span className="font-mono uppercase font-bold text-2xs">
        {currentLocale === 'en' ? 'العربية' : 'English'}
      </span>
    </Button>
  );
}

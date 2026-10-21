'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/use-i18n';
import Link from 'next/link';

/** App error boundary — never shows raw server errors to the user. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string; statusCode?: number; code?: string };
  reset: () => void;
}) {
  const { t, isAr } = useI18n();

  useEffect(() => {
    // Log to the server console for diagnostics only; never surface to the UI.
    console.error(error);
  }, [error]);

  const isAuthError =
    error?.statusCode === 401 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('401') ||
    error?.message?.includes('UNAUTHORIZED');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-bold">
        {isAuthError
          ? (isAr ? 'انتهت صلاحية الجلسة' : 'Session Expired')
          : t.common.errorTitle}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {isAuthError
          ? (isAr ? 'انتهت الجلسة، يرجى تسجيل الدخول من جديد للمتابعة' : 'Your session has expired. Please log in again to continue.')
          : t.errors.generic}
      </p>
      {isAuthError ? (
        <Button asChild className="bg-primary">
          <Link href="/login?expired=1">
            {isAr ? 'تسجيل الدخول من جديد' : 'Log In Again'}
          </Link>
        </Button>
      ) : (
        <Button onClick={reset}>{t.common.retry}</Button>
      )}
    </div>
  );
}

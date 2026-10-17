'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ar } from '@/messages/ar';
import Link from 'next/link';

/** Global error boundary — never shows raw server errors to the user. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; statusCode?: number; code?: string };
  reset: () => void;
}) {
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
        {isAuthError ? 'انتهت صلاحية الجلسة' : ar.common.errorTitle}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {isAuthError ? 'انتهت الجلسة، يرجى تسجيل الدخول من جديد للمتابعة' : ar.errors.generic}
      </p>
      {isAuthError ? (
        <Button asChild className="bg-primary">
          <Link href="/login?expired=1">تسجيل الدخول من جديد</Link>
        </Button>
      ) : (
        <Button onClick={reset}>{ar.common.retry}</Button>
      )}
    </div>
  );
}

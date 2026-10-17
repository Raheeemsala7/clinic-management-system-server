'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ar } from '@/messages/ar';

/** Global error boundary — never shows raw server errors to the user. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the server console for diagnostics only; never surface to the UI.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-lg font-semibold">{ar.common.errorTitle}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{ar.errors.generic}</p>
      <Button onClick={reset}>{ar.common.retry}</Button>
    </div>
  );
}

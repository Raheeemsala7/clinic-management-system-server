'use client';

import { useI18n } from '@/i18n/use-i18n';

export default function Loading() {
  const { isAr } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary"
        role="status"
        aria-label={isAr ? 'جارٍ التحميل' : 'Loading...'}
      />
    </div>
  );
}

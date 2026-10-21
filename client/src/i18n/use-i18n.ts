'use client';

import { useLocale } from 'next-intl';
import arMessages from './messages/ar.json';
import enMessages from './messages/en.json';

export type Messages = typeof arMessages;

export function getDictionary(locale: string = 'ar'): Messages {
  return locale === 'en' ? (enMessages as Messages) : (arMessages as Messages);
}

export function useI18n(): {
  t: Messages;
  locale: 'en' | 'ar';
  isAr: boolean;
} {
  const currentLocale = (useLocale() || 'ar') as 'en' | 'ar';
  const locale: 'en' | 'ar' = currentLocale === 'en' ? 'en' : 'ar';
  const t = locale === 'en' ? (enMessages as Messages) : (arMessages as Messages);
  const isAr = locale === 'ar';
  return { t, locale, isAr };
}

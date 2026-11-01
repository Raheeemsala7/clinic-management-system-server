export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';
export const LOCALE_COOKIE = 'NEXT_LOCALE';


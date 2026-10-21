import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches (en per spec requirements)
  defaultLocale: 'en',

  // Cookie-based routing without forced URL prefix
  localePrefix: 'never',
});
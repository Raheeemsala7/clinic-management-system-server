import { cookies } from 'next/headers';
import arMessages from './messages/ar.json';
import enMessages from './messages/en.json';
import type { Messages } from './use-i18n';

export async function getServerI18n(): Promise<{
  t: Messages;
  locale: 'en' | 'ar';
  isAr: boolean;
}> {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: 'en' | 'ar' = rawLocale === 'en' ? 'en' : 'ar';
  const t = locale === 'en' ? (enMessages as Messages) : (arMessages as Messages);
  const isAr = locale === 'ar';
  return { t, locale, isAr };
}

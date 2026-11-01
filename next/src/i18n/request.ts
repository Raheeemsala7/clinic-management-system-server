import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from './config';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

    const locale: Locale = hasLocale(locales, cookieLocale)
        ? (cookieLocale as Locale)
        : defaultLocale;

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});

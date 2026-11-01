'use server';

import { cookies } from 'next/headers';
import { hasLocale } from 'next-intl';
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from './config';

export async function setLocale(newLocale: string) {
    const cookieStore = await cookies();
    const locale: Locale = hasLocale(locales, newLocale)
        ? (newLocale as Locale)
        : defaultLocale;

    cookieStore.set(LOCALE_COOKIE, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
    });
}


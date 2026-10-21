import './globals.css';
import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { Toaster } from '@/components/ui/toast';
import { routing } from '@/i18n/routing';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Clinic Management System | نظام إدارة العيادة',
  description: 'Single-doctor clinic management platform | نظام إدارة العيادة الطبية',
};

type Props = {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const resolvedParams = params ? await params : undefined;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

  const candidate = resolvedParams?.locale || cookieLocale;
  const locale = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale;

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} ${inter.variable}`}>
      <body className={`min-h-screen bg-background antialiased ${dir === 'rtl' ? 'font-sans' : 'font-sans'}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

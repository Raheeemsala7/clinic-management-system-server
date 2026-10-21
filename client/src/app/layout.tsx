import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = localeCookie === 'ar' ? 'ar' : 'en';
  const isRtl = locale === 'ar';

  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body className={`min-h-screen bg-background antialiased ${isRtl ? 'font-sans' : 'font-sans'}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


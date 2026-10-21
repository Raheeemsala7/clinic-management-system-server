import { redirect } from 'next/navigation';
import { Stethoscope, AlertCircle } from 'lucide-react';
import { getSession, clearSessionCookies } from '@/lib/session';
import { homePathForRole } from '@/lib/roles';
import { getServerI18n } from '@/i18n/server';
import { LocaleSwitcher } from '@/components/shell/locale-switcher';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ expired?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const isExpired = Boolean(resolved?.expired);

  if (isExpired) {
    await clearSessionCookies();
  } else {
    const session = await getSession();
    if (session) redirect(homePathForRole(session.user.role));
  }

  const { t, locale, isAr } = await getServerI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="absolute top-4 end-4">
        <LocaleSwitcher currentLocale={locale} />
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-primary">{t.common.appName}</h1>
          <p className="text-sm text-muted-foreground">{t.auth.subtitle}</p>
        </div>

        {isExpired && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 font-medium">
            <AlertCircle className="size-4 shrink-0 text-amber-600" />
            <span>
              {isAr
                ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول من جديد.'
                : 'Your session has expired. Please log in again.'}
            </span>
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  );
}

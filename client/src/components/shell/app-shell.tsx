import { Stethoscope } from 'lucide-react';
import { cookies } from 'next/headers';
import { requireRole, type Role } from '@/lib/session';
import { homePathForRole } from '@/lib/roles';
import { getPrimaryDoctorStatus } from '@/lib/doctor';
import { NavLinks } from '@/components/shell/nav-links';
import { MobileNav } from '@/components/shell/mobile-nav';
import { UserMenu } from '@/components/shell/user-menu';
import { DoctorStatusBadge } from '@/components/shell/doctor-status-badge';
import { LocaleSwitcher } from '@/components/shell/locale-switcher';
import { logoutAction } from '@/features/auth/actions';

interface AppShellProps {
  role: Role;
  children: React.ReactNode;
}

const APP_NAMES = {
  ar: 'نظام إدارة العيادة',
  en: 'Clinic Management',
};

const ROLE_LABELS: Record<Role, { ar: string; en: string }> = {
  ADMIN: { ar: 'مدير', en: 'Admin' },
  DOCTOR: { ar: 'طبيب', en: 'Doctor' },
  RECEPTION: { ar: 'استقبال', en: 'Reception' },
};

export async function AppShell({ role, children }: AppShellProps) {
  const user = await requireRole([role]);
  const doctorStatus = await getPrimaryDoctorStatus();
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ar' ? 'ar' : 'en';

  const appName = APP_NAMES[locale];
  const roleName = ROLE_LABELS[role][locale];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr] bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden border-e bg-card lg:block shadow-xs">
        <div className="sticky top-0 flex h-screen flex-col justify-between p-4">
          <div className="space-y-4">
            <a
              href={homePathForRole(role)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-primary text-base hover:bg-primary/5 transition-colors"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Stethoscope className="size-5 text-primary" aria-hidden="true" />
              </div>
              <span className="truncate">{appName}</span>
            </a>
            <NavLinks role={role} locale={locale} />
          </div>

          <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              {locale === 'ar' ? 'لوحة:' : 'Panel:'} {roleName}
            </span>
            <span className="font-mono text-[11px] opacity-70">v1.0</span>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-6">
            <div className="flex items-center gap-2">
              <MobileNav role={role} locale={locale} />
              <a
                href={homePathForRole(role)}
                className="font-bold text-primary lg:hidden flex items-center gap-2"
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="size-4" />
                </div>
                <span className="font-bold text-sm sm:text-base">{appName}</span>
              </a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LocaleSwitcher currentLocale={locale} />
              {doctorStatus && <DoctorStatusBadge status={doctorStatus.status} />}
              <UserMenu name={user.name} role={user.role} logoutAction={logoutAction} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}


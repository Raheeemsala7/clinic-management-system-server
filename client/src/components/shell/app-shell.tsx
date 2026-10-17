import { Stethoscope } from 'lucide-react';
import { requireRole, type Role } from '@/lib/session';
import { homePathForRole } from '@/lib/roles';
import { getPrimaryDoctorStatus } from '@/lib/doctor';
import { NavLinks } from '@/components/shell/nav-links';
import { MobileNav } from '@/components/shell/mobile-nav';
import { UserMenu } from '@/components/shell/user-menu';
import { DoctorStatusBadge } from '@/components/shell/doctor-status-badge';
import { logoutAction } from '@/features/auth/actions';
import { ar } from '@/messages/ar';

interface AppShellProps {
  role: Role;
  children: React.ReactNode;
}

/**
 * Role-scoped application shell: sidebar on desktop, drawer on mobile, a header
 * with the (globally visible) doctor status badge and the user menu.
 *
 * Re-checks the role server-side so a forged link can never render another
 * role's chrome.
 */
export async function AppShell({ role, children }: AppShellProps) {
  const user = await requireRole([role]);
  const doctorStatus = await getPrimaryDoctorStatus();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-e bg-card lg:block">
        <div className="sticky top-0 flex h-screen flex-col gap-2 p-4">
          <a href={homePathForRole(role)} className="mb-2 flex items-center gap-2 px-2 font-bold text-primary">
            <Stethoscope className="size-6" aria-hidden="true" />
            <span>{ar.common.appName}</span>
          </a>
          <NavLinks role={role} />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex h-16 items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-2">
              <MobileNav role={role} />
              <a href={homePathForRole(role)} className="font-bold text-primary lg:hidden">
                {ar.common.appName}
              </a>
            </div>
            <div className="flex items-center gap-3">
              {doctorStatus && <DoctorStatusBadge status={doctorStatus.status} />}
              <UserMenu name={user.name} role={user.role} logoutAction={logoutAction} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

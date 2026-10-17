import { AppShell } from '@/components/shell/app-shell';

/** All doctor pages are private and role-specific → always dynamic. */
export const dynamic = 'force-dynamic';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="DOCTOR">{children}</AppShell>;
}

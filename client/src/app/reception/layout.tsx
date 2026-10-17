import { AppShell } from '@/components/shell/app-shell';

/** All reception pages are private and role-specific → always dynamic. */
export const dynamic = 'force-dynamic';

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="RECEPTION">{children}</AppShell>;
}

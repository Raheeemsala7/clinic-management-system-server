import { AppShell } from '@/components/shell/app-shell';

/** All admin pages are private and role-specific → always dynamic. */
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="ADMIN">{children}</AppShell>;
}

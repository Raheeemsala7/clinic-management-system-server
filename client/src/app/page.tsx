import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { homePathForRole } from '@/lib/roles';

/** Entry point: send each visitor to the home of their role. */
export default async function RootPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  redirect(homePathForRole(session.user.role));
}

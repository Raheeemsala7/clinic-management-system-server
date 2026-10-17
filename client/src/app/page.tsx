import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default function RootPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');
  if (session.user.role === 'DOCTOR') redirect('/doctor');
  redirect('/reception');
}

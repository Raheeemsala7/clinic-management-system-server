import { redirect } from 'next/navigation';
import { Stethoscope } from 'lucide-react';
import { getSession } from '@/lib/session';
import { homePathForRole } from '@/lib/roles';
import { ar } from '@/messages/ar';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(homePathForRole(session.user.role));

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-primary">{ar.common.appName}</h1>
          <p className="text-sm text-muted-foreground">{ar.auth.subtitle}</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

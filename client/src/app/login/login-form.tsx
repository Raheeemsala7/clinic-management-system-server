'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/use-i18n';
import { loginAction } from '@/features/auth/actions';

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      {pending ? loadingLabel : label}
    </Button>
  );
}

export function LoginForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="space-y-4" aria-label={t.auth.title}>
      {state.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">{t.auth.username}</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          required
          autoFocus
          dir="ltr"
          className="text-start"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="text-start"
        />
      </div>

      <SubmitButton label={t.auth.login} loadingLabel={t.auth.loggingIn} />
    </form>
  );
}

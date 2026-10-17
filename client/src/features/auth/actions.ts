'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { clearSessionCookies, setSessionCookies, type TokenResponse } from '@/lib/session';
import { homePathForRole } from '@/lib/roles';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * Login is a Server Action: it calls the backend, stores both tokens in
 * httpOnly cookies (never readable by browser JS), then redirects by role.
 */
export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: ar.errors.VALIDATION_FAILED };
  }

  let data: TokenResponse;
  try {
    data = await api.post<TokenResponse>('/auth/login', parsed.data);
  } catch {
    return { error: ar.auth.invalidCredentials };
  }

  await setSessionCookies(data);
  // redirect() must run outside try/catch so NEXT_REDIRECT is not swallowed.
  redirect(homePathForRole(data.user.role));
}

/** Clear the session cookies (best-effort backend revoke) and return to login. */
export async function logoutAction(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Backend may reject an expired token; cookies are cleared regardless.
  }
  await clearSessionCookies();
  redirect('/login');
}

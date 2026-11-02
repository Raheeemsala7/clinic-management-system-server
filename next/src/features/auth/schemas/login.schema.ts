import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loginSchema = (t: any) =>
  z.object({
      username: z
      .string()
      .trim()
      .nonempty(t("usernameRequired"))
      .min(3, t("usernameMin")),

    password: z.string().nonempty(t('passwordRequired')),
  });


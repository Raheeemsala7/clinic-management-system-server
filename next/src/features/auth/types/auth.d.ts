import { z } from 'zod';
import { loginSchema } from '../schemas/login.schema';

export type LoginFormType = z.infer<ReturnType<typeof loginSchema>>;

export type LoginResponseData = {
  user: UserData;
  accessToken: string;
  refreshToken: string;
}

export type UserData = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "PATIENT";
}
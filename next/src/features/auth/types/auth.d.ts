import { loginSchema } from "../schemas/login.schema";

export type LoginFormType = z.infer<ReturnType<typeof loginSchema>>;
export interface LoginFormValues {
  username: string;
  password: string;
}

export interface LoginState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}


export type Role = "admin" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  createdAt: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  fetchMe: () => Promise<void>;
  setAccessToken: (token: string) => void;
  reset: () => void;
};

export type FieldError = { field: string; message: string };
export type ApiError = { message: string; errors?: FieldError[] };

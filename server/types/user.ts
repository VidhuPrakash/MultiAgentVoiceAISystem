export interface User {
  id?: string;
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: "admin" | "user";
  plan?: "free" | "starter" | "pro";
}

export interface TokenPayload {
  userId: string;
  role: "admin" | "user";
}

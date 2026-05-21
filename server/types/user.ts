export interface User {
  id?: string;
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: "admin" | "user";
}

export interface TokenPayload {
  userId: string;
  role: "admin" | "user";
}

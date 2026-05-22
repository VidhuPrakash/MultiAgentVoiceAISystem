import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export type TokenPayload = {
  userId: string;
  role: "admin" | "user";
  plan: "free" | "starter" | "pro";
};

export const signAccess = (payload: TokenPayload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

export const signRefresh = (payload: TokenPayload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccess = (token: string) =>
  jwt.verify(token, ACCESS_SECRET) as TokenPayload;

export const verifyRefresh = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as TokenPayload;

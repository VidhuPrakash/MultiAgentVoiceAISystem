import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import bcrypt from "bcryptjs";
import { signAccess, signRefresh, verifyRefresh } from "../../lib/token";
import {
  clearRefreshCookie,
  setRefreshCookie,
  REFRESH_COOKIE,
} from "../../lib/cookies";
import { Request, Response } from "express";
import {
  checkExistingUserWithEmail,
  createUser,
  getUserByEmail,
  createSession,
  getSessionByToken,
  deleteSessionByToken,
  getUserByIdSafe,
} from "./service";
import { registerSchema, loginSchema } from "./validation";

/*
Register user controller
@route POST /api/auth/register
*/
export const RegisterUserController = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
        success: false,
      });
    }
    const { name, email, password } = parsed.data;

    const existing = await checkExistingUserWithEmail(email);

    if (existing)
      return res
        .status(409)
        .json({ error: "Email already registered", success: false });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({
      name,
      email,
      passwordHash,
    });

    const payload = { userId: user.id, role: user.role ?? ("user" as const) };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    await createSession(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      data: {
        token: accessToken,
        user,
      },
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong", success: false });
  }
};
/*
Login user controller
@route POST /api/auth/login
*/
export const LoginUserController = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        errors: parsed.error.issues.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
        success: false,
      });
    }
    const { email, password } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user)
      return res
        .status(401)
        .json({ error: "Invalid credentials", success: false });

    if (user.isBlocked)
      return res
        .status(403)
        .json({ error: "Account blocked. Contact support.", success: false });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res
        .status(401)
        .json({ error: "Invalid credentials", success: false });

    const payload = { userId: user.id, role: user.role ?? ("user" as const) };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    await createSession(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Login successful",
        success: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong", success: false });
  }
};
/*
refresh user controller
@route POST /api/auth/refresh
*/
export const refreshTokenController = async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const session = await getSessionByToken(token);
    if (!session || session.expiresAt < new Date()) {
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({ error: "Session expired. Please login again." });
    }

    const payload = verifyRefresh(token);

    await deleteSessionByToken(token);
    const newRefreshToken = signRefresh({
      userId: payload.userId,
      role: payload.role,
    });
    await createSession(payload.userId, newRefreshToken);
    setRefreshCookie(res, newRefreshToken);

    const newAccess = signAccess({
      userId: payload.userId,
      role: payload.role,
    });
    res.json({ accessToken: newAccess });
  } catch {
    clearRefreshCookie(res);
    return res
      .status(401)
      .json({ error: "Session expired. Please login again." });
  }
};

/*
Logout controller
@route POST /api/auth/logout
*/
export const logoutController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      await deleteSessionByToken(token).catch(() => {});
    }
    clearRefreshCookie(res);
    res.json({ message: "Logged out successfully", success: true });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong", success: false });
  }
};

/*
Me controller
@route POST /api/auth/me
*/
export const meController = async (req: Request, res: Response) => {
  try {
    const user = await getUserByIdSafe(req.user!.userId);
    if (!user)
      return res.status(404).json({ error: "User not found", success: false });
    res.json({
      data: user,
      message: "User fetched successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong", success: false });
  }
};

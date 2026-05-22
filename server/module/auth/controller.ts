import bcrypt from "bcryptjs";
import { signAccess, signRefresh, verifyRefresh } from "../../lib/token";
import {
  clearRefreshCookie,
  setRefreshCookie,
  REFRESH_COOKIE,
} from "../../lib/cookies";
import { Request, Response } from "express";
import * as svc from "./service";
import { registerSchema, loginSchema } from "./validation";
import { ok, fail } from "../../helper/response";

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

    const existing = await svc.checkExistingUserWithEmail(email);

    if (existing) return fail(res, 409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await svc.createUser({
      name,
      email,
      passwordHash,
    });

    const payload = {
      userId: user.id,
      role: user.role ?? ("user" as const),
      plan: user?.plan ?? ("free" as const),
    };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    await svc.createSession(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    ok(res, { accessToken, user }, "User registered successfully");
  } catch (error) {
    fail(res, 500, "Something went wrong");
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

    const user = await svc.getUserByEmail(email);
    if (!user) return fail(res, 401, "Invalid credentials");

    if (user.isBlocked)
      return fail(res, 403, "Account blocked. Contact support.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 401, "Invalid credentials");

    const payload = {
      userId: user.id,
      role: user.role ?? ("user" as const),
      plan: user?.plan ?? ("free" as const),
    };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    await svc.createSession(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    ok(
      res,
      {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful",
    );
  } catch (error) {
    fail(res, 500, "Something went wrong");
  }
};
/*
refresh user controller
@route POST /api/auth/refresh
*/
export const refreshTokenController = async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) return fail(res, 401, "No refresh token");

  try {
    const session = await svc.getSessionByToken(token);
    if (!session || session.expiresAt < new Date()) {
      clearRefreshCookie(res);
      return fail(res, 401, "Session expired. Please login again.");
    }

    const payload = verifyRefresh(token);

    await svc.deleteSessionByToken(token);
    const newRefreshToken = signRefresh({
      userId: payload.userId,
      role: payload.role,
      plan: payload.plan,
    });
    await svc.createSession(payload.userId, newRefreshToken);
    setRefreshCookie(res, newRefreshToken);

    const newAccess = signAccess({
      userId: payload.userId,
      role: payload.role,
      plan: payload.plan,
    });
    ok(res, { accessToken: newAccess });
  } catch {
    clearRefreshCookie(res);
    return fail(res, 401, "Session expired. Please login again.");
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
      await svc.deleteSessionByToken(token).catch(() => {});
    }
    clearRefreshCookie(res);
    ok(res, null, "Logged out successfully");
  } catch (error) {
    fail(res, 500, "Something went wrong");
  }
};

/*
Me controller
@route POST /api/auth/me
*/
export const meController = async (req: Request, res: Response) => {
  try {
    const user = await svc.getUserByIdSafe(req.user!.userId);
    if (!user) return fail(res, 404, "User not found");
    ok(res, user, "User fetched successfully");
  } catch (error) {
    fail(res, 500, "Something went wrong");
  }
};

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { verifyAccess, TokenPayload } from "../lib/token";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const bearerTokenSchema = z
  .string()
  .regex(
    /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
    "Malformed token",
  );

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });

  const raw = authHeader.slice(7);
  const parsed = bearerTokenSchema.safeParse(raw);

  if (!parsed.success)
    return res.status(401).json({ error: "Malformed token" });

  try {
    req.user = verifyAccess(parsed.data);
    next();
  } catch {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin")
      return res.status(403).json({ error: "Admin only" });
    next();
  });
}

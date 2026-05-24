import type { Request, Response, NextFunction } from "express";
import { callsQuerySchema, callIdSchema } from "./validation";
import * as svc from "./service";
import { fail, ok } from "../../helper/response";

// GET /api/user/calls
export async function listCalls(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = callsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const result = await svc.getUserCalls(req.user!.userId, parsed.data);
    ok(res, result);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/calls/stats
export async function getCallStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stats = await svc.getUserCallStats(req.user!.userId);
    ok(res, stats);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/calls/:id
export async function getCall(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = callIdSchema.safeParse(req.params);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const call = await svc.getUserCallById(parsed.data.id, req.user!.userId);
    if (!call) return fail(res, 404, "Call not found");

    ok(res, call);
  } catch (e) {
    next(e);
  }
}

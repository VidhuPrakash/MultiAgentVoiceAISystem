import type { Request, Response, NextFunction } from "express";
import { rangeSchema } from "./validation";
import * as svc from "./service";
import { ok, fail } from "../../helper/response";

// GET /api/user/analytics/summary
export async function getSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await svc.getUserSummary(req.user!.userId);
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/analytics/calls-over-time?range=monthly
export async function getCallsOverTime(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { range } = rangeSchema.parse(req.query);
    const data = await svc.getUserCallsOverTime(req.user!.userId, range);
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/analytics/call-status
export async function getCallStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await svc.getUserCallStatusBreakdown(req.user!.userId);
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/analytics/agent-performance
export async function getAgentPerformance(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await svc.getUserAgentPerformance(req.user!.userId);
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/analytics/minutes-over-time?range=monthly
export async function getMinutesOverTime(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { range } = rangeSchema.parse(req.query);
    const data = await svc.getUserMinutesOverTime(req.user!.userId, range);
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/analytics/recent-leads
export async function getRecentLeads(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await svc.getUserRecentLeads(req.user!.userId);
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

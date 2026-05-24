import type { Request, Response, NextFunction } from "express";
import { requestUpgradeSchema } from "./validation";
import * as svc from "./service";
import { fail, ok } from "../../helper/response";

// GET /api/user/billing
export async function getBilling(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const billing = await svc.getUserBilling(req.user!.userId);
    if (!billing) return fail(res, 404, "User not found");

    ok(res, billing);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/billing/history
export async function getUsageHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const history = await svc.getUsageHistory(req.user!.userId);
    ok(res, history);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/billing/plans
export async function getPlans(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const plans = await svc.getAllPlans();
    ok(res, plans);
  } catch (e) {
    next(e);
  }
}

// POST /api/user/billing/upgrade
// No real payment — sends upgrade request to admin
export async function requestUpgrade(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = requestUpgradeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    // For now — just return a message
    // Admin manually upgrades via PATCH /api/admin/users/:id/plan
    // Will wire Stripe later
    ok(
      res,
      {
        requestedPlan: parsed.data.plan,
        status: "pending",
        message: "Upgrade request received. Admin will process shortly.",
      },
      "Upgrade requested",
    );
  } catch (e) {
    next(e);
  }
}

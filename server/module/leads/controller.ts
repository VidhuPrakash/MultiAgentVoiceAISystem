import type { Request, Response, NextFunction } from "express";
import { leadsQuerySchema, leadIdSchema, updateLeadSchema } from "./validation";
import * as svc from "./service";
import { fail, ok } from "../../helper/response";

export async function listLeads(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = leadsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const result = await svc.getUserLeads(req.user!.userId, parsed.data);
    ok(res, result);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/leads/stats
export async function getLeadStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stats = await svc.getLeadStats(req.user!.userId);
    ok(res, stats);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/leads/:id
export async function getLead(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = leadIdSchema.safeParse(req.params);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const lead = await svc.getUserLeadById(parsed.data.id, req.user!.userId);
    if (!lead) return fail(res, 404, "Lead not found");

    ok(res, lead);
  } catch (e) {
    next(e);
  }
}

// PATCH /api/user/leads/:id
export async function updateLead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idParsed = leadIdSchema.safeParse(req.params);
    if (!idParsed.success) {
      const errors = idParsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const updated = await svc.updateLead(
      idParsed.data.id,
      req.user!.userId,
      parsed.data,
    );
    if (!updated) return fail(res, 404, "Lead not found");

    ok(res, updated, "Lead updated");
  } catch (e) {
    next(e);
  }
}

// DELETE /api/user/leads/:id
export async function deleteLead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = leadIdSchema.safeParse(req.params);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const deleted = await svc.deleteLead(parsed.data.id, req.user!.userId);
    if (!deleted) return fail(res, 404, "Lead not found");

    ok(res, null, "Lead deleted");
  } catch (e) {
    next(e);
  }
}

import type { Request, Response, NextFunction } from "express";
import {
  createAgentSchema,
  updateAgentSchema,
  agentIdSchema,
} from "./validation";
import * as svc from "./service";

// Plan limits — how many agents per plan
const AGENT_LIMITS: Record<string, number> = {
  free: 1,
  starter: 5,
  pro: 20,
};

const ok = (res: Response, data: unknown, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, message });

// GET /api/user/agents
export async function listAgents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const agents = await svc.getUserAgents(req.user!.userId);
    ok(res, agents);
  } catch (e) {
    next(e);
  }
}

// GET /api/user/agents/:id
export async function getAgent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = agentIdSchema.safeParse(req.params);
    if (!parsed.success) return fail(res, 400, "Invalid agent ID");

    const agent = await svc.getAgentById(parsed.data.id, req.user!.userId);
    if (!agent) return fail(res, 404, "Agent not found");

    ok(res, agent);
  } catch (e) {
    next(e);
  }
}

// POST /api/user/agents
export async function createAgent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    // Enforce plan agent limit
    const plan = req.user!.plan ?? "free";
    const limit = AGENT_LIMITS[plan] ?? 1;
    const current = await svc.getUserAgentCount(req.user!.userId);

    if (current >= limit) {
      return fail(
        res,
        403,
        `Your ${plan} plan allows up to ${limit} agent${limit > 1 ? "s" : ""}. Upgrade to create more.`,
      );
    }

    const agent = await svc.createAgent(req.user!.userId, parsed.data);
    ok(res, agent, "Agent created", 201);
  } catch (e) {
    next(e);
  }
}

// PATCH /api/user/agents/:id
export async function updateAgent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idParsed = agentIdSchema.safeParse(req.params);
    if (!idParsed.success) return fail(res, 400, "Invalid agent ID");

    const parsed = updateAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const updated = await svc.updateAgent(
      idParsed.data.id,
      req.user!.userId,
      parsed.data,
    );
    if (!updated) return fail(res, 404, "Agent not found");

    ok(res, updated, "Agent updated");
  } catch (e) {
    next(e);
  }
}

// DELETE /api/user/agents/:id
export async function deleteAgent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = agentIdSchema.safeParse(req.params);
    if (!parsed.success) return fail(res, 400, "Invalid agent ID");

    const deleted = await svc.deleteAgent(parsed.data.id, req.user!.userId);
    if (!deleted) return fail(res, 404, "Agent not found");

    ok(res, null, "Agent deleted");
  } catch (e) {
    next(e);
  }
}

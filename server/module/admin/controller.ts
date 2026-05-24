import type { Request, Response, NextFunction } from "express";
import {
  createUserSchema,
  updateUserSchema,
  updateAgentSchema,
  paginationSchema,
  analyticsRangeSchema,
  assignPlanSchema,
  assignPhoneSchema,
} from "./validation";
import * as svc from "./service";
import { fail, ok } from "../../helper/response";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await svc.getAllUsers(page, limit);
    ok(res, result);
  } catch (e) {
    next(e);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await svc.getUserById(id);
    if (!user) return fail(res, 404, "User not found");
    ok(res, user);
  } catch (e) {
    next(e);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    const result = await svc.adminCreateUser(parsed.data);
    if (result.error) return fail(res, 409, result.error);
    ok(res, result.user, "User created");
  } catch (e) {
    next(e);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await svc.adminUpdateUser(id, parsed.data);
    if (!updated) return fail(res, 404, "User not found");
    ok(res, updated, "User updated");
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // prevent admin deleting themselves
    if (req.params.id === req.user!.userId)
      return fail(res, 400, "Cannot delete your own account");

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await svc.adminDeleteUser(id);
    if (!deleted) return fail(res, 404, "User not found");
    ok(res, null, "User deleted");
  } catch (e) {
    next(e);
  }
}

export async function blockUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.params.id === req.user!.userId)
      return fail(res, 400, "Cannot block your own account");

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await svc.blockUnblockUser(id, true);
    if (!updated) return fail(res, 404, "User not found");
    ok(res, updated, "User blocked");
  } catch (e) {
    next(e);
  }
}

export async function unblockUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await svc.blockUnblockUser(id, false);
    if (!updated) return fail(res, 404, "User not found");
    ok(res, updated, "User unblocked");
  } catch (e) {
    next(e);
  }
}

export async function getAgents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await svc.getAllAgents(page, limit);
    ok(res, result);
  } catch (e) {
    next(e);
  }
}

export async function updateAgent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = updateAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await svc.adminUpdateAgent(id, parsed.data);
    if (!updated) return fail(res, 404, "Agent not found");
    ok(res, updated, "Agent updated");
  } catch (e) {
    next(e);
  }
}

export async function getCalls(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await svc.getAllCalls(page, limit);
    ok(res, result);
  } catch (e) {
    next(e);
  }
}

export async function getCall(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const call = await svc.getCallById(id);
    if (!call) return fail(res, 404, "Call not found");
    ok(res, call);
  } catch (e) {
    next(e);
  }
}

export async function getDashboardSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await svc.getDashboardSummary();
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

export async function getUsersOverTime(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { range } = analyticsRangeSchema.parse(req.query);
    ok(res, await svc.getUsersOverTime(range));
  } catch (e) {
    next(e);
  }
}

export async function getPlanDistribution(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    ok(res, await svc.getPlanDistribution());
  } catch (e) {
    next(e);
  }
}

export async function getTopMinutesUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    ok(res, await svc.getTopMinutesUsers());
  } catch (e) {
    next(e);
  }
}

export async function getCallsOverTime(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { range } = analyticsRangeSchema.parse(req.query);
    ok(res, await svc.getCallsOverTime(range));
  } catch (e) {
    next(e);
  }
}

export async function getCallStatusDistribution(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    ok(res, await svc.getCallStatusDistribution());
  } catch (e) {
    next(e);
  }
}

export async function getAvgCallDuration(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    ok(res, await svc.getAvgCallDuration());
  } catch (e) {
    next(e);
  }
}

export async function assignPhone(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = assignPhoneSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await svc.assignPhoneNumber(
      id,
      parsed.data.vapiPhoneNumberId,
    );
    if (!updated) return fail(res, 404, "User not found");

    ok(res, updated, "Phone number assigned");
  } catch (e) {
    next(e);
  }
}

export async function assignPlan(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = assignPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await svc.assignPlan(
      id,
      parsed.data.plan,
      parsed.data.minutesLimit,
    );
    if (!updated) return fail(res, 404, "User not found");

    ok(res, updated, "Plan assigned");
  } catch (e) {
    next(e);
  }
}

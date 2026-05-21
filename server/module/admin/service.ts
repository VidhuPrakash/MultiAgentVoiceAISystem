import { db } from "../../db";
import { users, agents, calls, leads, sessions } from "../../db/schema";
import { eq, desc, count, sum, sql, ilike, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { z } from "zod";
import type {
  createUserSchema,
  updateUserSchema,
  updateAgentSchema,
  assignPlanSchema,
} from "./validation";

export async function getAllUsers(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        plan: users.plan,
        minutesLimit: users.minutesLimit,
        minutesUsed: users.minutesUsed,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: count() }).from(users),
  ]);

  return { rows, total: Number(total), page, limit };
}

export async function getUserById(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      plan: users.plan,
      minutesLimit: users.minutesLimit,
      minutesUsed: users.minutesUsed,
      isBlocked: users.isBlocked,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id));

  return user ?? null;
}

export async function adminCreateUser(data: z.infer<typeof createUserSchema>) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });
  if (existing) return { error: "Email already registered" };

  const passwordHash = await bcrypt.hash(data.password, 12);

  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      plan: data.plan,
      minutesLimit: data.minutesLimit,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      plan: users.plan,
    });

  return { user };
}

export async function adminUpdateUser(
  id: string,
  data: z.infer<typeof updateUserSchema>,
) {
  const [updated] = await db
    .update(users)
    .set({ ...data })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      plan: users.plan,
      minutesLimit: users.minutesLimit,
      isBlocked: users.isBlocked,
    });
  return updated ?? null;
}

export async function adminDeleteUser(id: string) {
  await db.delete(sessions).where(eq(sessions.userId, id));
  await db.delete(leads).where(eq(leads.userId, id));
  await db.delete(calls).where(eq(calls.userId, id));
  await db.delete(agents).where(eq(agents.userId, id));
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return deleted ?? null;
}

export async function blockUnblockUser(id: string, block: boolean) {
  if (block) await db.delete(sessions).where(eq(sessions.userId, id));

  const [updated] = await db
    .update(users)
    .set({ isBlocked: block })
    .where(eq(users.id, id))
    .returning({ id: users.id, isBlocked: users.isBlocked });
  return updated ?? null;
}

export async function assignPlan(
  id: string,
  data: z.infer<typeof assignPlanSchema>,
) {
  const [updated] = await db
    .update(users)
    .set({ plan: data.plan, minutesLimit: data.minutesLimit })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      plan: users.plan,
      minutesLimit: users.minutesLimit,
    });
  return updated ?? null;
}

export async function getAllAgents(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: agents.id,
        name: agents.name,
        type: agents.type,
        voice: agents.voice,
        isActive: agents.isActive,
        vapiAssistantId: agents.vapiAssistantId,
        createdAt: agents.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(agents)
      .leftJoin(users, eq(agents.userId, users.id))
      .orderBy(desc(agents.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: count() }).from(agents),
  ]);

  return { rows, total: Number(total), page, limit };
}

export async function adminUpdateAgent(
  id: string,
  data: z.infer<typeof updateAgentSchema>,
) {
  const [updated] = await db
    .update(agents)
    .set({ ...data })
    .where(eq(agents.id, id))
    .returning();
  return updated ?? null;
}

export async function adminGetAgentById(id: string) {
  const [row] = await db.select().from(agents).where(eq(agents.id, id));
  return row ?? null;
}

export async function getAllCalls(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: calls.id,
        status: calls.status,
        callerNumber: calls.callerNumber,
        duration: calls.duration,
        recordingUrl: calls.recordingUrl,
        startedAt: calls.startedAt,
        endedAt: calls.endedAt,
        user: { id: users.id, name: users.name, email: users.email },
        agent: { id: agents.id, name: agents.name, type: agents.type },
      })
      .from(calls)
      .leftJoin(users, eq(calls.userId, users.id))
      .leftJoin(agents, eq(calls.agentId, agents.id))
      .orderBy(desc(calls.startedAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: count() }).from(calls),
  ]);

  return { rows, total: Number(total), page, limit };
}

export async function getCallById(id: string) {
  const [row] = await db
    .select({
      id: calls.id,
      status: calls.status,
      callerNumber: calls.callerNumber,
      duration: calls.duration,
      recordingUrl: calls.recordingUrl,
      transcript: calls.transcript,
      startedAt: calls.startedAt,
      endedAt: calls.endedAt,
      vapiCallId: calls.vapiCallId,
      user: { id: users.id, name: users.name, email: users.email },
      agent: { id: agents.id, name: agents.name, type: agents.type },
    })
    .from(calls)
    .leftJoin(users, eq(calls.userId, users.id))
    .leftJoin(agents, eq(calls.agentId, agents.id))
    .where(eq(calls.id, id));

  return row ?? null;
}

export async function getPlatformStats() {
  const [[userStats], [callStats], [agentStats]] = await Promise.all([
    db
      .select({
        total: count(),
        blocked: sql<number>`count(*) filter (where ${users.isBlocked} = true)`,
      })
      .from(users),

    db
      .select({
        total: count(),
        completed: sql<number>`count(*) filter (where ${calls.status} = 'completed')`,
        missed: sql<number>`count(*) filter (where ${calls.status} = 'missed')`,
        totalMinutes: sql<number>`coalesce(sum(${calls.duration}), 0)`,
      })
      .from(calls),

    db.select({ total: count() }).from(agents),
  ]);

  return {
    users: {
      total: Number(userStats.total),
      blocked: Number(userStats.blocked),
    },
    calls: {
      total: Number(callStats.total),
      completed: Number(callStats.completed),
      missed: Number(callStats.missed),
      totalMinutes: Math.round(Number(callStats.totalMinutes) / 60),
    },
    agents: {
      total: Number(agentStats.total),
    },
  };
}

export async function getUserUsageStats(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      minutesLimit: users.minutesLimit,
      minutesUsed: users.minutesUsed,
      totalCalls: sql<number>`count(${calls.id})`,
    })
    .from(users)
    .leftJoin(calls, eq(calls.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.minutesUsed))
    .limit(limit)
    .offset(offset);

  return rows;
}

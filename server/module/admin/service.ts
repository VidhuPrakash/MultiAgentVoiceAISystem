import { db } from "../../db";
import { users, agents, calls, leads, sessions } from "../../db/schema";
import { eq, desc, count, sql, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { z } from "zod";
import type {
  createUserSchema,
  updateUserSchema,
  updateAgentSchema,
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

export async function getAllAgents(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: agents.id,
        name: agents.name,
        type: agents.type,
        systemPrompt: agents.systemPrompt,
        voice: agents.voice,
        isActive: agents.isActive,
        vapiAssistantId: agents.vapiAssistantId,
        createdAt: agents.createdAt,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
          plan: users.plan,
        },
      })
      .from(agents)
      .where(isNull(agents.deletedAt))
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

// New users per month or year
export async function getUsersOverTime(range: "daily" | "monthly" | "yearly") {
  const format =
    range === "daily"
      ? sql`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`
      : range === "monthly"
        ? sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`
        : sql`TO_CHAR(${users.createdAt}, 'YYYY')`;

  const rows = await db
    .select({ period: format, count: count() })
    .from(users)
    .groupBy(format)
    .orderBy(format);

  return rows;
}

// Plan distribution for radar/pie
export async function getPlanDistribution() {
  const rows = await db
    .select({ plan: users.plan, count: count() })
    .from(users)
    .groupBy(users.plan);
  return rows;
}

// Top 5 users by minutesUsed
export async function getTopMinutesUsers() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      minutesUsed: users.minutesUsed,
      minutesLimit: users.minutesLimit,
    })
    .from(users)
    .where(eq(users.role, "user"))
    .orderBy(desc(users.minutesUsed))
    .limit(5);
  return rows;
}

// Calls over time
export async function getCallsOverTime(range: "daily" | "monthly" | "yearly") {
  const format =
    range === "daily"
      ? sql`TO_CHAR(${calls.startedAt}, 'YYYY-MM-DD')`
      : range === "monthly"
        ? sql`TO_CHAR(${calls.startedAt}, 'YYYY-MM')`
        : sql`TO_CHAR(${calls.startedAt}, 'YYYY')`;

  const rows = await db
    .select({ period: format, count: count() })
    .from(calls)
    .groupBy(format)
    .orderBy(format);

  return rows;
}

// Summary stats card
export async function getDashboardSummary() {
  const [
    [{ totalUsers }],
    [{ totalCalls }],
    [{ totalAgents }],
    [{ blockedUsers }],
  ] = await Promise.all([
    db.select({ totalUsers: count() }).from(users),
    db.select({ totalCalls: count() }).from(calls),
    db.select({ totalAgents: count() }).from(agents),
    db
      .select({ blockedUsers: count() })
      .from(users)
      .where(eq(users.isBlocked, true)),
  ]);

  // Total minutes consumed across all users
  const [{ totalMinutes }] = await db
    .select({
      totalMinutes: sql<number>`COALESCE(SUM(${users.minutesUsed}), 0)`,
    })
    .from(users);

  return {
    totalUsers: Number(totalUsers),
    totalCalls: Number(totalCalls),
    totalAgents: Number(totalAgents),
    blockedUsers: Number(blockedUsers),
    totalMinutes: Number(totalMinutes),
  };
}

// Call status distribution (completed/failed/missed etc.)
export async function getCallStatusDistribution() {
  const rows = await db
    .select({ status: calls.status, count: count() })
    .from(calls)
    .groupBy(calls.status);
  return rows;
}

// Avg call duration per month
export async function getAvgCallDuration() {
  const rows = await db
    .select({
      period: sql`TO_CHAR(${calls.startedAt}, 'YYYY-MM')`,
      avgDuration: sql<number>`ROUND(AVG(${calls.duration}), 2)`,
    })
    .from(calls)
    .where(sql`${calls.duration} IS NOT NULL`)
    .groupBy(sql`TO_CHAR(${calls.startedAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${calls.startedAt}, 'YYYY-MM')`);
  return rows;
}

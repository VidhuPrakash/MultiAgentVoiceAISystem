import { db } from "../../db";
import { calls, agents, leads, users } from "../../db/schema";
import { eq, and, desc, count, isNull, sql, gte } from "drizzle-orm";

// Dashboard summary
export async function getUserSummary(userId: string) {
  const [[callStats], [leadStats], [agentStats], [user]] = await Promise.all([
    db
      .select({
        total: sql<number>`COUNT(*)::int`,
        completed: sql<number>`
            COUNT(*) FILTER (
              WHERE ${calls.status}='completed'
            )::int
          `,
        missed: sql<number>`
            COUNT(*) FILTER (
              WHERE ${calls.status}='missed'
            )::int
          `,
        failed: sql<number>`
            COUNT(*) FILTER (
              WHERE ${calls.status}='failed'
            )::int
          `,
        in_progress: sql<number>`
            COUNT(*) FILTER (
              WHERE ${calls.status}='in-progress'
            )::int
          `,
        total_seconds: sql<number>`
            COALESCE(
              SUM(${calls.duration})
              FILTER (
                WHERE ${calls.status}='completed'
              ),
              0
            )::int
          `,
      })
      .from(calls)
      .where(eq(calls.userId, userId)),

    db
      .select({
        total: sql<number>`
            COUNT(*)::int
          `,
      })
      .from(leads)
      .where(eq(leads.userId, userId)),

    db
      .select({
        total: sql<number>`
            COUNT(*)::int
          `,
        active: sql<number>`
            COUNT(*) FILTER (
              WHERE ${agents.isActive}=true
            )::int
          `,
      })
      .from(agents)
      .where(and(eq(agents.userId, userId), isNull(agents.deletedAt))),

    db
      .select({
        plan: users.plan,
        minutesLimit: users.minutesLimit,
        vapiPhoneNumberId: users.vapiPhoneNumberId,
      })
      .from(users)
      .where(eq(users.id, userId)),
  ]);

  const totalMinutes = Math.ceil(Number(callStats.total_seconds) / 60);

  // derive usage from calls instead of users.minutesUsed
  const minutesLimit = user.minutesLimit ?? 100;

  const minutesUsed = totalMinutes;

  const usagePct =
    minutesLimit > 0
      ? Math.min(100, Math.round((minutesUsed / minutesLimit) * 100))
      : 0;

  return {
    calls: {
      total: callStats.total,
      completed: callStats.completed,
      missed: callStats.missed,
      failed: callStats.failed,
      inProgress: callStats.in_progress,

      answered: callStats.completed + callStats.in_progress,
    },

    minutes: {
      used: minutesUsed,
      limit: minutesLimit,

      remaining: Math.max(0, minutesLimit - minutesUsed),

      percent: usagePct,

      fromCalls: totalMinutes,
    },

    leads: {
      total: leadStats.total,
    },

    agents: {
      total: agentStats.total,
      active: agentStats.active,
    },

    plan: user.plan,
    vapiPhoneNumberId: user.vapiPhoneNumberId,
  };
}

// Calls over time
export async function getUserCallsOverTime(
  userId: string,
  range: "daily" | "monthly" | "yearly",
) {
  const from = new Date();

  if (range === "daily") {
    from.setDate(from.getDate() - 30);
  } else if (range === "monthly") {
    from.setMonth(from.getMonth() - 12);
  } else {
    from.setFullYear(from.getFullYear() - 5);
  }

  // SQL keywords must be inlined, not parameterized
  const periodExpr =
    range === "daily"
      ? sql<string>`TO_CHAR(DATE_TRUNC('day', ${calls.startedAt}), 'YYYY-MM-DD')`
      : range === "monthly"
        ? sql<string>`TO_CHAR(DATE_TRUNC('month', ${calls.startedAt}), 'Mon YYYY')`
        : sql<string>`TO_CHAR(DATE_TRUNC('year', ${calls.startedAt}), 'YYYY')`;

  const dateExpr =
    range === "daily"
      ? sql`DATE_TRUNC('day', ${calls.startedAt})`
      : range === "monthly"
        ? sql`DATE_TRUNC('month', ${calls.startedAt})`
        : sql`DATE_TRUNC('year', ${calls.startedAt})`;

  const rows = await db
    .select({
      period: periodExpr,

      total: sql<number>`
        COUNT(*)::int
      `,

      completed: sql<number>`
        COUNT(*) FILTER(
          WHERE ${calls.status}='completed'
        )::int
      `,

      missed: sql<number>`
        COUNT(*) FILTER(
          WHERE ${calls.status}='missed'
        )::int
      `,
    })
    .from(calls)
    .where(and(eq(calls.userId, userId), gte(calls.startedAt, from)))
    .groupBy(dateExpr)
    .orderBy(dateExpr);

  return rows;
}
// Call status breakdown
export async function getUserCallStatusBreakdown(userId: string) {
  const rows = await db
    .select({
      status: calls.status,
      count: count(),
    })
    .from(calls)
    .where(eq(calls.userId, userId))
    .groupBy(calls.status);

  // ensure all statuses present even if 0
  const map: Record<string, number> = {
    completed: 0,
    missed: 0,
    failed: 0,
    "in-progress": 0,
  };
  rows.forEach((r) => {
    map[r.status!] = Number(r.count);
  });

  return Object.entries(map).map(([status, value]) => ({ status, value }));
}

// Agent performance breakdown
export async function getUserAgentPerformance(userId: string) {
  const rows = await db
    .select({
      agentId: agents.id,
      agentName: agents.name,
      agentType: agents.type,

      total: sql<number>`
        COUNT(${calls.id})::int
      `,

      completed: sql<number>`
        COUNT(${calls.id})
        FILTER (
          WHERE ${calls.status}='completed'
        )::int
      `,

      missed: sql<number>`
        COUNT(${calls.id})
        FILTER (
          WHERE ${calls.status}='missed'
        )::int
      `,

      avgSeconds: sql<number>`
        COALESCE(
          ROUND(
            AVG(${calls.duration})
            FILTER (
              WHERE ${calls.status}='completed'
            )
          ),
          0
        )::int
      `,
    })
    .from(agents)
    .leftJoin(calls, eq(calls.agentId, agents.id))
    .where(and(eq(agents.userId, userId), isNull(agents.deletedAt)))
    .groupBy(agents.id, agents.name, agents.type)
    .orderBy(desc(sql`COUNT(${calls.id})`));

  return rows.map((r) => ({
    ...r,
    avgMinutes: Math.ceil(r.avgSeconds / 60),
  }));
}

// Minutes usage over time
export async function getUserMinutesOverTime(
  userId: string,
  range: "daily" | "monthly" | "yearly",
) {
  const from = new Date();

  if (range === "daily") {
    from.setDate(from.getDate() - 30);
  } else if (range === "monthly") {
    from.setMonth(from.getMonth() - 12);
  } else {
    from.setFullYear(from.getFullYear() - 5);
  }

  // PostgreSQL DATE_TRUNC and TO_CHAR formats
  // cannot be passed as prepared params
  const periodExpr =
    range === "daily"
      ? sql<string>`
          TO_CHAR(
            DATE_TRUNC('day', ${calls.startedAt}),
            'YYYY-MM-DD'
          )
        `
      : range === "monthly"
        ? sql<string>`
            TO_CHAR(
              DATE_TRUNC('month', ${calls.startedAt}),
              'Mon YYYY'
            )
          `
        : sql<string>`
            TO_CHAR(
              DATE_TRUNC('year', ${calls.startedAt}),
              'YYYY'
            )
          `;

  const dateExpr =
    range === "daily"
      ? sql`
          DATE_TRUNC('day', ${calls.startedAt})
        `
      : range === "monthly"
        ? sql`
            DATE_TRUNC('month', ${calls.startedAt})
          `
        : sql`
            DATE_TRUNC('year', ${calls.startedAt})
          `;

  const rows = await db
    .select({
      period: periodExpr,

      totalSeconds: sql<number>`
        COALESCE(
          SUM(${calls.duration})
          FILTER (
            WHERE ${calls.status}='completed'
          ),
          0
        )::int
      `,

      callCount: sql<number>`
        COUNT(*)
        FILTER (
          WHERE ${calls.status}='completed'
        )::int
      `,
    })
    .from(calls)
    .where(and(eq(calls.userId, userId), gte(calls.startedAt, from)))
    .groupBy(dateExpr)
    .orderBy(dateExpr);

  return rows.map((r) => ({
    period: r.period,
    minutes: Math.ceil(Number(r.totalSeconds) / 60),
    callCount: Number(r.callCount),
  }));
}
//Recent leads
export async function getUserRecentLeads(userId: string, limit = 5) {
  const rows = await db
    .select({
      id: leads.id,
      name: leads.name,
      phone: leads.phone,
      purpose: leads.purpose,
      service: leads.service,
      appointmentDate: leads.appointmentDate,
      createdAt: leads.createdAt,
      agent: {
        name: agents.name,
        type: agents.type,
      },
    })
    .from(leads)
    .leftJoin(calls, eq(leads.callId, calls.id))
    .leftJoin(agents, eq(calls.agentId, agents.id))
    .where(eq(leads.userId, userId))
    .orderBy(desc(leads.createdAt))
    .limit(limit);

  return rows;
}

import { db } from "../../db";
import { users, calls } from "../../db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export const PLAN_DETAILS = {
  free: {
    name: "Free",
    minutesLimit: 100,
    agentLimit: 1,
    price: 0,
    features: [
      "1 AI voice agent",
      "100 minutes per month",
      "Call history",
      "Basic lead capture",
    ],
  },
  starter: {
    name: "Starter",
    minutesLimit: 500,
    agentLimit: 5,
    price: 29,
    features: [
      "5 AI voice agents",
      "500 minutes per month",
      "Full call history + recordings",
      "Lead tracking",
      "Priority support",
    ],
  },
  pro: {
    name: "Pro",
    minutesLimit: 2000,
    agentLimit: 20,
    price: 99,
    features: [
      "20 AI voice agents",
      "2000 minutes per month",
      "Full call history + recordings",
      "Advanced lead tracking",
      "Analytics dashboard",
      "Dedicated support",
    ],
  },
};

export async function getUserBilling(userId: string) {
  // Get user plan info
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      minutesLimit: users.minutesLimit,
      minutesUsed: users.minutesUsed,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return null;

  const plan = user.plan ?? "free";
  const planDetails = PLAN_DETAILS[plan as keyof typeof PLAN_DETAILS];

  // Minutes this month only
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthlyRow] = await db
    .select({
      calls_this_month: sql<number>`
      COUNT(*)::int
    `,
      minutes_this_month: sql<number>`
      COALESCE(SUM(${calls.duration}),0)::int
    `,
    })
    .from(calls)
    .where(
      and(
        eq(calls.userId, userId),
        gte(calls.startedAt, startOfMonth),
        eq(calls.status, "completed"),
      ),
    );

  const minutesUsed = Math.ceil(
    Number(monthlyRow.minutes_this_month ?? 0) / 60,
  );

  const minutesLimit = user.minutesLimit ?? planDetails.minutesLimit;

  const minutesRemaining = Math.max(0, minutesLimit - minutesUsed);

  const usagePercent =
    minutesLimit > 0
      ? Math.min(100, Math.round((minutesUsed / minutesLimit) * 100))
      : 0;

  return {
    plan: {
      current: plan,
      name: planDetails.name,
      price: planDetails.price,
      features: planDetails.features,
    },
    usage: {
      minutesUsed,
      minutesLimit,
      minutesRemaining,
      usagePercent,
      callsThisMonth: Number(monthlyRow.calls_this_month),
      minutesThisMonth: minutesUsed,
    },
    limits: {
      agentLimit: planDetails.agentLimit,
    },
    memberSince: user.createdAt,
  };
}

export async function getUsageHistory(userId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const rows = await db
    .select({
      month: sql<string>`
        TO_CHAR(
          DATE_TRUNC('month', ${calls.startedAt}),
          'Mon YYYY'
        )
      `,
      total_calls: sql<number>`
        COUNT(*)::int
      `,
      total_minutes: sql<number>`
        COALESCE(SUM(${calls.duration}),0)::int
      `,
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
      sortMonth: sql`
        DATE_TRUNC('month', ${calls.startedAt})
      `,
    })
    .from(calls)
    .where(and(eq(calls.userId, userId), gte(calls.startedAt, sixMonthsAgo)))
    .groupBy(sql`DATE_TRUNC('month', ${calls.startedAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${calls.startedAt}) ASC`);

  return rows.map((r) => ({
    month: r.month,
    totalCalls: r.total_calls ?? 0,
    totalMinutes: Math.ceil((r.total_minutes ?? 0) / 60),
    completed: r.completed ?? 0,
    missed: r.missed ?? 0,
  }));
}

export async function getAllPlans() {
  return Object.entries(PLAN_DETAILS).map(([key, val]) => ({
    id: key,
    ...val,
  }));
}

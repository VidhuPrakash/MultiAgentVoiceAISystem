import { db } from "../../db";
import { calls, agents } from "../../db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import type { z } from "zod";
import type { callsQuerySchema } from "./validation";
import { sql } from "drizzle-orm";

export async function getUserCalls(
  userId: string,
  query: z.infer<typeof callsQuerySchema>,
) {
  const offset = (query.page - 1) * query.limit;

  const where = query.status
    ? and(eq(calls.userId, userId), eq(calls.status, query.status))
    : eq(calls.userId, userId);

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
        agent: {
          id: agents.id,
          name: agents.name,
          type: agents.type,
        },
      })
      .from(calls)
      .leftJoin(agents, eq(calls.agentId, agents.id))
      .where(where)
      .orderBy(desc(calls.startedAt))
      .limit(query.limit)
      .offset(offset),

    db.select({ total: count() }).from(calls).where(where),
  ]);

  return {
    rows,
    total: Number(total),
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(Number(total) / query.limit),
  };
}

export async function getUserCallById(id: string, userId: string) {
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
      agent: {
        id: agents.id,
        name: agents.name,
        type: agents.type,
      },
    })
    .from(calls)
    .leftJoin(agents, eq(calls.agentId, agents.id))
    .where(
      and(
        eq(calls.id, id),
        eq(calls.userId, userId), 
      ),
    );

  return row ?? null;
}

export async function getUserCallStats(userId: string) {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      completed: sql<number>`COUNT(*) FILTER (WHERE ${calls.status} = 'completed')::int`,
      missed: sql<number>`COUNT(*) FILTER (WHERE ${calls.status} = 'missed')::int`,
      failed: sql<number>`COUNT(*) FILTER (WHERE ${calls.status} = 'failed')::int`,
      total_minutes: sql<number>`COALESCE(SUM(${calls.duration}),0)::int`,
    })
    .from(calls)
    .where(sql`${calls.userId} = ${userId}`);

  return {
    total: row?.total ?? 0,
    completed: row?.completed ?? 0,
    missed: row?.missed ?? 0,
    failed: row?.failed ?? 0,
    totalMinutes: Math.ceil((row?.total_minutes ?? 0) / 60),
  };
}

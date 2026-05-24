import { db } from "../../db";
import { leads, calls, agents } from "../../db/schema";
import { eq, and, desc, count, ilike } from "drizzle-orm";
import type { z } from "zod";
import type { leadsQuerySchema, updateLeadSchema } from "./validation";
import { sql } from "drizzle-orm";

export async function getUserLeads(
  userId: string,
  query: z.infer<typeof leadsQuerySchema>,
) {
  const offset = (query.page - 1) * query.limit;

  const where = query.purpose
    ? and(eq(leads.userId, userId), ilike(leads.purpose, `%${query.purpose}%`))
    : eq(leads.userId, userId);

  const [rawRows, [{ total }]] = await Promise.all([
    db
      .select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        purpose: leads.purpose,
        service: leads.service,
        appointmentDate: leads.appointmentDate,
        createdAt: leads.createdAt,

        callId: calls.id,
        callStatus: calls.status,
        callDuration: calls.duration,

        agentId: agents.id,
        agentName: agents.name,
        agentType: agents.type,
      })
      .from(leads)
      .leftJoin(calls, eq(leads.callId, calls.id))
      .leftJoin(agents, eq(calls.agentId, agents.id))
      .where(where)
      .orderBy(desc(leads.createdAt))
      .limit(query.limit)
      .offset(offset),

    db.select({ total: count() }).from(leads).where(where),
  ]);

  const rows = rawRows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    purpose: row.purpose,
    service: row.service,
    appointmentDate: row.appointmentDate,
    createdAt: row.createdAt,

    call: row.callId
      ? {
          id: row.callId,
          status: row.callStatus,
          duration: row.callDuration,
          agent: row.agentId
            ? {
                id: row.agentId,
                name: row.agentName,
                type: row.agentType,
              }
            : null,
        }
      : null,
  }));

  return {
    rows,
    total: Number(total),
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(Number(total) / query.limit),
  };
}

export async function getUserLeadById(id: string, userId: string) {
  const [row] = await db
    .select({
      id: leads.id,
      name: leads.name,
      phone: leads.phone,
      purpose: leads.purpose,
      service: leads.service,
      appointmentDate: leads.appointmentDate,
      createdAt: leads.createdAt,
      call: {
        id: calls.id,
        status: calls.status,
        duration: calls.duration,
        callerNumber: calls.callerNumber,
        recordingUrl: calls.recordingUrl,
        transcript: calls.transcript,
        startedAt: calls.startedAt,
      },
      agent: {
        id: agents.id,
        name: agents.name,
        type: agents.type,
      },
    })
    .from(leads)
    .leftJoin(calls, eq(leads.callId, calls.id))
    .leftJoin(agents, eq(calls.agentId, agents.id))
    .where(and(eq(leads.id, id), eq(leads.userId, userId)));

  return row ?? null;
}

export async function updateLead(
  id: string,
  userId: string,
  data: z.infer<typeof updateLeadSchema>,
) {
  const [updated] = await db
    .update(leads)
    .set({ ...data })
    .where(and(eq(leads.id, id), eq(leads.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function deleteLead(id: string, userId: string) {
  const [deleted] = await db
    .delete(leads)
    .where(and(eq(leads.id, id), eq(leads.userId, userId)))
    .returning({ id: leads.id });

  return deleted ?? null;
}

export async function getLeadStats(userId: string) {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      with_name: sql<number>`
        COUNT(*) FILTER (
          WHERE ${leads.name} IS NOT NULL
        )::int
      `,
      with_phone: sql<number>`
        COUNT(*) FILTER (
          WHERE ${leads.phone} IS NOT NULL
        )::int
      `,
      appointments: sql<number>`
        COUNT(*) FILTER (
          WHERE ${leads.purpose} = 'appointment'
        )::int
      `,
    })
    .from(leads)
    .where(eq(leads.userId, userId));

  return {
    total: row?.total ?? 0,
    withName: row?.with_name ?? 0,
    withPhone: row?.with_phone ?? 0,
    appointments: row?.appointments ?? 0,
  };
}

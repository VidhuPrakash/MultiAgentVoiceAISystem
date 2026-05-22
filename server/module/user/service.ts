import { eq, and, count, desc, isNull } from "drizzle-orm";
import type { z } from "zod";
import type { createAgentSchema, updateAgentSchema } from "./validation";
import { db } from "../../db";
import { agents } from "../../db/schema";
import { buildDefaultPrompt, DEFAULT_FIRST_MESSAGES } from "./prompt";
import "dotenv/config";

const VAPI_BASE = process.env.VAPI_API_BASE!;
const VAPI_KEY = process.env.VAPI_API_KEY!;

async function vapiPost(path: string, body: unknown) {
  const res = await fetch(`${VAPI_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vapi error ${res.status}: ${err}`);
  }
  return res.json();
}

async function vapiPatch(path: string, body: unknown) {
  const res = await fetch(`${VAPI_BASE}${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${VAPI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vapi error ${res.status}: ${err}`);
  }
  return res.json();
}

async function vapiDelete(path: string) {
  await fetch(`${VAPI_BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${VAPI_KEY}` },
  });
}

export async function getUserAgents(userId: string) {
  const rows = await db
    .select({
      id: agents.id,
      name: agents.name,
      type: agents.type,
      voice: agents.voice,
      isActive: agents.isActive,
      firstMessage: agents.firstMessage,
      vapiAssistantId: agents.vapiAssistantId,
      createdAt: agents.createdAt,
    })
    .from(agents)
    .where(and(eq(agents.userId, userId), isNull(agents.deletedAt)))
    .orderBy(desc(agents.createdAt));

  return rows;
}

export async function getAgentById(id: string, userId: string) {
  const [agent] = await db
    .select()
    .from(agents)
    .where(
      and(
        eq(agents.id, id),
        eq(agents.userId, userId),
        isNull(agents.deletedAt),
      ),
    );

  return agent ?? null;
}

export async function createAgent(
  userId: string,
  data: z.infer<typeof createAgentSchema>,
) {
  const systemPrompt =
    data.systemPrompt ?? buildDefaultPrompt(data.type, data.businessName ?? "");

  const firstMessage = data.firstMessage ?? DEFAULT_FIRST_MESSAGES[data.type];

  const vapiAssistant = await vapiPost("/assistant", {
    name: data.name,
    model: {
      provider: "openai",
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
    },
    voice: {
      provider: "openai",
      voiceId: data.voice ?? "shimmer",
    },
    firstMessage,
    recordingEnabled: true,
    endCallFunctionEnabled: true,
  });

  const [agent] = await db
    .insert(agents)
    .values({
      userId,
      vapiAssistantId: vapiAssistant.id,
      name: data.name,
      type: data.type,
      systemPrompt,
      voice: data.voice ?? "shimmer",
      firstMessage,
      isActive: true,
    })
    .returning();

  return agent;
}

export async function updateAgent(
  id: string,
  userId: string,
  data: z.infer<typeof updateAgentSchema>,
) {
  const existing = await getAgentById(id, userId);
  if (!existing) return null;

  if (data.systemPrompt || data.voice || data.name || data.firstMessage) {
    const vapiUpdate: Record<string, unknown> = {};

    if (data.name) vapiUpdate.name = data.name;

    if (data.firstMessage) vapiUpdate.firstMessage = data.firstMessage;

    if (data.systemPrompt || data.voice) {
      vapiUpdate.model = {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: data.systemPrompt ?? existing.systemPrompt,
          },
        ],
        temperature: 0.7,
      };
      vapiUpdate.voice = {
        provider: "openai",
        voiceId: data.voice ?? existing.voice ?? "shimmer",
      };
    }

    await vapiPatch(`/assistant/${existing.vapiAssistantId}`, vapiUpdate);
  }

  const [updated] = await db
    .update(agents)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.systemPrompt && { systemPrompt: data.systemPrompt }),
      ...(data.voice && { voice: data.voice }),
      ...(data.firstMessage && { firstMessage: data.firstMessage }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })
    .where(and(eq(agents.id, id), eq(agents.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function deleteAgent(id: string, userId: string) {
  const existing = await getAgentById(id, userId);
  if (!existing) return null;

  if (existing.vapiAssistantId) {
    await vapiDelete(`/assistant/${existing.vapiAssistantId}`);
  }

  const [deleted] = await db
    .update(agents)
    .set({ deletedAt: new Date() })
    .where(and(eq(agents.id, id), eq(agents.userId, userId)))
    .returning({ id: agents.id });

  return deleted ?? null;
}

export async function getUserAgentCount(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(agents)
    .where(and(eq(agents.userId, userId), isNull(agents.deletedAt)));
  return Number(total);
}

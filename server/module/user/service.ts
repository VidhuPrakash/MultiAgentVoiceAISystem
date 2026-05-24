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

  const vapiPayload = await buildVapiPayload(
    { ...data, systemPrompt, firstMessage },
    userId,
  );

   const vapiAssistant = await vapiPost("/assistant", vapiPayload);


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

  if (data.type === "appointment" || data.type === "faq") {
    await syncReceptionistTools(userId);
  }
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

    if (data.isActive !== undefined) {
      await syncReceptionistTools(userId);
    }

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

async function buildVapiPayload(
  data: z.infer<typeof createAgentSchema> & {
    systemPrompt: string;
    firstMessage: string;
  },
  userId: string,
) {
  const base = {
    name: data.name,
    model: {
      provider: "openai",
      model: "gpt-4o",
      messages: [{ role: "system", content: data.systemPrompt }],
      temperature: 0.7,
    },
    voice: {
      provider: "openai",
      voiceId: data.voice ?? "shimmer",
    },
    firstMessage: data.firstMessage,
    recordingEnabled: true,
    endCallFunctionEnabled: true,
  };

  // Only receptionist needs transfer tool
  if (data.type !== "receptionist") return base;

  // Get sibling agents for this user
  const siblings = await db
    .select({
      type: agents.type,
      vapiAssistantId: agents.vapiAssistantId,
    })
    .from(agents)
    .where(and(eq(agents.userId, userId), eq(agents.isActive, true)));

  const appointmentAgent = siblings.find((a) => a.type === "appointment");
  const faqAgent = siblings.find((a) => a.type === "faq");

  // Build transfer destinations
  const destinations: unknown[] = [];

  if (appointmentAgent?.vapiAssistantId) {
    destinations.push({
      type: "assistant",
      assistantId: appointmentAgent.vapiAssistantId,
      message: "Let me connect you with our scheduling team!",
      description: "Transfer to appointment booking agent",
    });
  }

  if (faqAgent?.vapiAssistantId) {
    destinations.push({
      type: "assistant",
      assistantId: faqAgent.vapiAssistantId,
      message: "Let me connect you with our support team!",
      description: "Transfer to FAQ and support agent",
    });
  }

  if (destinations.length === 0) return base;

  return {
    ...base,
    tools: [
      {
        type: "transferCall",
        destinations,
      },
    ],
  };
}

export async function syncReceptionistTools(userId: string) {
  // Find receptionist for this user
  const receptionist = await db.query.agents.findFirst({
    where: and(
      eq(agents.userId, userId),
      eq(agents.type, "receptionist"),
      isNull(agents.deletedAt),
    ),
  });

  if (!receptionist?.vapiAssistantId) return;

  // Get other agents
  const siblings = await db
    .select({ type: agents.type, vapiAssistantId: agents.vapiAssistantId })
    .from(agents)
    .where(
      and(
        eq(agents.userId, userId),
        eq(agents.isActive, true),
        isNull(agents.deletedAt),
      ),
    );

  const appointmentAgent = siblings.find((a) => a.type === "appointment");
  const faqAgent = siblings.find((a) => a.type === "faq");

  const destinations: unknown[] = [];

  if (appointmentAgent?.vapiAssistantId) {
    destinations.push({
      type: "assistant",
      assistantId: appointmentAgent.vapiAssistantId,
      message: "Let me connect you with our scheduling team!",
      description: "Transfer to appointment booking",
    });
  }

  if (faqAgent?.vapiAssistantId) {
    destinations.push({
      type: "assistant",
      assistantId: faqAgent.vapiAssistantId,
      message: "Connecting you with our support team!",
      description: "Transfer to FAQ support",
    });
  }

  if (destinations.length === 0) return;

  await vapiPatch(`/assistant/${receptionist.vapiAssistantId}`, {
    tools: [{ type: "transferCall", destinations }],
  });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgents = getUserAgents;
exports.getAgentById = getAgentById;
exports.createAgent = createAgent;
exports.updateAgent = updateAgent;
exports.deleteAgent = deleteAgent;
exports.getUserAgentCount = getUserAgentCount;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const prompt_1 = require("./prompt");
require("dotenv/config");
const VAPI_BASE = process.env.VAPI_API_BASE;
const VAPI_KEY = process.env.VAPI_API_KEY;
async function vapiPost(path, body) {
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
async function vapiPatch(path, body) {
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
async function vapiDelete(path) {
    await fetch(`${VAPI_BASE}${path}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${VAPI_KEY}` },
    });
}
async function getUserAgents(userId) {
    const rows = await db_1.db
        .select({
        id: schema_1.agents.id,
        name: schema_1.agents.name,
        type: schema_1.agents.type,
        voice: schema_1.agents.voice,
        isActive: schema_1.agents.isActive,
        firstMessage: schema_1.agents.firstMessage,
        vapiAssistantId: schema_1.agents.vapiAssistantId,
        createdAt: schema_1.agents.createdAt,
    })
        .from(schema_1.agents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.userId, userId), (0, drizzle_orm_1.isNull)(schema_1.agents.deletedAt)))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.agents.createdAt));
    return rows;
}
async function getAgentById(id, userId) {
    const [agent] = await db_1.db
        .select()
        .from(schema_1.agents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, id), (0, drizzle_orm_1.eq)(schema_1.agents.userId, userId), (0, drizzle_orm_1.isNull)(schema_1.agents.deletedAt)));
    return agent ?? null;
}
async function createAgent(userId, data) {
    const systemPrompt = data.systemPrompt ?? (0, prompt_1.buildDefaultPrompt)(data.type, data.businessName ?? "");
    const firstMessage = data.firstMessage ?? prompt_1.DEFAULT_FIRST_MESSAGES[data.type];
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
    const [agent] = await db_1.db
        .insert(schema_1.agents)
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
async function updateAgent(id, userId, data) {
    const existing = await getAgentById(id, userId);
    if (!existing)
        return null;
    if (data.systemPrompt || data.voice || data.name || data.firstMessage) {
        const vapiUpdate = {};
        if (data.name)
            vapiUpdate.name = data.name;
        if (data.firstMessage)
            vapiUpdate.firstMessage = data.firstMessage;
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
    const [updated] = await db_1.db
        .update(schema_1.agents)
        .set({
        ...(data.name && { name: data.name }),
        ...(data.systemPrompt && { systemPrompt: data.systemPrompt }),
        ...(data.voice && { voice: data.voice }),
        ...(data.firstMessage && { firstMessage: data.firstMessage }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, id), (0, drizzle_orm_1.eq)(schema_1.agents.userId, userId)))
        .returning();
    return updated ?? null;
}
async function deleteAgent(id, userId) {
    const existing = await getAgentById(id, userId);
    if (!existing)
        return null;
    if (existing.vapiAssistantId) {
        await vapiDelete(`/assistant/${existing.vapiAssistantId}`);
    }
    const [deleted] = await db_1.db
        .update(schema_1.agents)
        .set({ deletedAt: new Date() })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, id), (0, drizzle_orm_1.eq)(schema_1.agents.userId, userId)))
        .returning({ id: schema_1.agents.id });
    return deleted ?? null;
}
async function getUserAgentCount(userId) {
    const [{ total }] = await db_1.db
        .select({ total: (0, drizzle_orm_1.count)() })
        .from(schema_1.agents)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.userId, userId), (0, drizzle_orm_1.isNull)(schema_1.agents.deletedAt)));
    return Number(total);
}

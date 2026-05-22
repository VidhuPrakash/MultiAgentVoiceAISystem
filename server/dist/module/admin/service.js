"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.adminCreateUser = adminCreateUser;
exports.adminUpdateUser = adminUpdateUser;
exports.adminDeleteUser = adminDeleteUser;
exports.blockUnblockUser = blockUnblockUser;
exports.getAllAgents = getAllAgents;
exports.adminUpdateAgent = adminUpdateAgent;
exports.getAllCalls = getAllCalls;
exports.getCallById = getCallById;
exports.getUsersOverTime = getUsersOverTime;
exports.getPlanDistribution = getPlanDistribution;
exports.getTopMinutesUsers = getTopMinutesUsers;
exports.getCallsOverTime = getCallsOverTime;
exports.getDashboardSummary = getDashboardSummary;
exports.getCallStatusDistribution = getCallStatusDistribution;
exports.getAvgCallDuration = getAvgCallDuration;
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function getAllUsers(page, limit) {
    const offset = (page - 1) * limit;
    const [rows, [{ total }]] = await Promise.all([
        db_1.db
            .select({
            id: schema_1.users.id,
            name: schema_1.users.name,
            email: schema_1.users.email,
            role: schema_1.users.role,
            plan: schema_1.users.plan,
            minutesLimit: schema_1.users.minutesLimit,
            minutesUsed: schema_1.users.minutesUsed,
            isBlocked: schema_1.users.isBlocked,
            createdAt: schema_1.users.createdAt,
        })
            .from(schema_1.users)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.users.createdAt))
            .limit(limit)
            .offset(offset),
        db_1.db.select({ total: (0, drizzle_orm_1.count)() }).from(schema_1.users),
    ]);
    return { rows, total: Number(total), page, limit };
}
async function getUserById(id) {
    const [user] = await db_1.db
        .select({
        id: schema_1.users.id,
        name: schema_1.users.name,
        email: schema_1.users.email,
        role: schema_1.users.role,
        plan: schema_1.users.plan,
        minutesLimit: schema_1.users.minutesLimit,
        minutesUsed: schema_1.users.minutesUsed,
        isBlocked: schema_1.users.isBlocked,
        createdAt: schema_1.users.createdAt,
    })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    return user ?? null;
}
async function adminCreateUser(data) {
    const existing = await db_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.email, data.email),
    });
    if (existing)
        return { error: "Email already registered" };
    const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
    const [user] = await db_1.db
        .insert(schema_1.users)
        .values({
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        plan: data.plan,
        minutesLimit: data.minutesLimit,
    })
        .returning({
        id: schema_1.users.id,
        name: schema_1.users.name,
        email: schema_1.users.email,
        role: schema_1.users.role,
        plan: schema_1.users.plan,
    });
    return { user };
}
async function adminUpdateUser(id, data) {
    const [updated] = await db_1.db
        .update(schema_1.users)
        .set({ ...data })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
        .returning({
        id: schema_1.users.id,
        name: schema_1.users.name,
        email: schema_1.users.email,
        role: schema_1.users.role,
        plan: schema_1.users.plan,
        minutesLimit: schema_1.users.minutesLimit,
        isBlocked: schema_1.users.isBlocked,
    });
    return updated ?? null;
}
async function adminDeleteUser(id) {
    await db_1.db.delete(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.userId, id));
    await db_1.db.delete(schema_1.leads).where((0, drizzle_orm_1.eq)(schema_1.leads.userId, id));
    await db_1.db.delete(schema_1.calls).where((0, drizzle_orm_1.eq)(schema_1.calls.userId, id));
    await db_1.db.delete(schema_1.agents).where((0, drizzle_orm_1.eq)(schema_1.agents.userId, id));
    const [deleted] = await db_1.db
        .delete(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
        .returning({ id: schema_1.users.id });
    return deleted ?? null;
}
async function blockUnblockUser(id, block) {
    if (block)
        await db_1.db.delete(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.userId, id));
    const [updated] = await db_1.db
        .update(schema_1.users)
        .set({ isBlocked: block })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
        .returning({ id: schema_1.users.id, isBlocked: schema_1.users.isBlocked });
    return updated ?? null;
}
async function getAllAgents(page, limit) {
    const offset = (page - 1) * limit;
    const [rows, [{ total }]] = await Promise.all([
        db_1.db
            .select({
            id: schema_1.agents.id,
            name: schema_1.agents.name,
            type: schema_1.agents.type,
            systemPrompt: schema_1.agents.systemPrompt,
            voice: schema_1.agents.voice,
            isActive: schema_1.agents.isActive,
            vapiAssistantId: schema_1.agents.vapiAssistantId,
            createdAt: schema_1.agents.createdAt,
            owner: {
                id: schema_1.users.id,
                name: schema_1.users.name,
                email: schema_1.users.email,
                plan: schema_1.users.plan,
            },
        })
            .from(schema_1.agents)
            .where((0, drizzle_orm_1.isNull)(schema_1.agents.deletedAt))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.agents.userId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.agents.createdAt))
            .limit(limit)
            .offset(offset),
        db_1.db.select({ total: (0, drizzle_orm_1.count)() }).from(schema_1.agents),
    ]);
    return { rows, total: Number(total), page, limit };
}
async function adminUpdateAgent(id, data) {
    const [updated] = await db_1.db
        .update(schema_1.agents)
        .set({ ...data })
        .where((0, drizzle_orm_1.eq)(schema_1.agents.id, id))
        .returning();
    return updated ?? null;
}
async function getAllCalls(page, limit) {
    const offset = (page - 1) * limit;
    const [rows, [{ total }]] = await Promise.all([
        db_1.db
            .select({
            id: schema_1.calls.id,
            status: schema_1.calls.status,
            callerNumber: schema_1.calls.callerNumber,
            duration: schema_1.calls.duration,
            recordingUrl: schema_1.calls.recordingUrl,
            startedAt: schema_1.calls.startedAt,
            endedAt: schema_1.calls.endedAt,
            user: { id: schema_1.users.id, name: schema_1.users.name, email: schema_1.users.email },
            agent: { id: schema_1.agents.id, name: schema_1.agents.name, type: schema_1.agents.type },
        })
            .from(schema_1.calls)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.calls.userId, schema_1.users.id))
            .leftJoin(schema_1.agents, (0, drizzle_orm_1.eq)(schema_1.calls.agentId, schema_1.agents.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.calls.startedAt))
            .limit(limit)
            .offset(offset),
        db_1.db.select({ total: (0, drizzle_orm_1.count)() }).from(schema_1.calls),
    ]);
    return { rows, total: Number(total), page, limit };
}
async function getCallById(id) {
    const [row] = await db_1.db
        .select({
        id: schema_1.calls.id,
        status: schema_1.calls.status,
        callerNumber: schema_1.calls.callerNumber,
        duration: schema_1.calls.duration,
        recordingUrl: schema_1.calls.recordingUrl,
        transcript: schema_1.calls.transcript,
        startedAt: schema_1.calls.startedAt,
        endedAt: schema_1.calls.endedAt,
        vapiCallId: schema_1.calls.vapiCallId,
        user: { id: schema_1.users.id, name: schema_1.users.name, email: schema_1.users.email },
        agent: { id: schema_1.agents.id, name: schema_1.agents.name, type: schema_1.agents.type },
    })
        .from(schema_1.calls)
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.calls.userId, schema_1.users.id))
        .leftJoin(schema_1.agents, (0, drizzle_orm_1.eq)(schema_1.calls.agentId, schema_1.agents.id))
        .where((0, drizzle_orm_1.eq)(schema_1.calls.id, id));
    return row ?? null;
}
// New users per month or year
async function getUsersOverTime(range) {
    const format = range === "daily"
        ? (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.users.createdAt}, 'YYYY-MM-DD')`
        : range === "monthly"
            ? (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.users.createdAt}, 'YYYY-MM')`
            : (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.users.createdAt}, 'YYYY')`;
    const rows = await db_1.db
        .select({ period: format, count: (0, drizzle_orm_1.count)() })
        .from(schema_1.users)
        .groupBy(format)
        .orderBy(format);
    return rows;
}
// Plan distribution for radar/pie
async function getPlanDistribution() {
    const rows = await db_1.db
        .select({ plan: schema_1.users.plan, count: (0, drizzle_orm_1.count)() })
        .from(schema_1.users)
        .groupBy(schema_1.users.plan);
    return rows;
}
// Top 5 users by minutesUsed
async function getTopMinutesUsers() {
    const rows = await db_1.db
        .select({
        id: schema_1.users.id,
        name: schema_1.users.name,
        email: schema_1.users.email,
        plan: schema_1.users.plan,
        minutesUsed: schema_1.users.minutesUsed,
        minutesLimit: schema_1.users.minutesLimit,
    })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.role, "user"))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.users.minutesUsed))
        .limit(5);
    return rows;
}
// Calls over time
async function getCallsOverTime(range) {
    const format = range === "daily"
        ? (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.calls.startedAt}, 'YYYY-MM-DD')`
        : range === "monthly"
            ? (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.calls.startedAt}, 'YYYY-MM')`
            : (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.calls.startedAt}, 'YYYY')`;
    const rows = await db_1.db
        .select({ period: format, count: (0, drizzle_orm_1.count)() })
        .from(schema_1.calls)
        .groupBy(format)
        .orderBy(format);
    return rows;
}
// Summary stats card
async function getDashboardSummary() {
    const [[{ totalUsers }], [{ totalCalls }], [{ totalAgents }], [{ blockedUsers }],] = await Promise.all([
        db_1.db.select({ totalUsers: (0, drizzle_orm_1.count)() }).from(schema_1.users),
        db_1.db.select({ totalCalls: (0, drizzle_orm_1.count)() }).from(schema_1.calls),
        db_1.db.select({ totalAgents: (0, drizzle_orm_1.count)() }).from(schema_1.agents),
        db_1.db
            .select({ blockedUsers: (0, drizzle_orm_1.count)() })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.isBlocked, true)),
    ]);
    // Total minutes consumed across all users
    const [{ totalMinutes }] = await db_1.db
        .select({
        totalMinutes: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.users.minutesUsed}), 0)`,
    })
        .from(schema_1.users);
    return {
        totalUsers: Number(totalUsers),
        totalCalls: Number(totalCalls),
        totalAgents: Number(totalAgents),
        blockedUsers: Number(blockedUsers),
        totalMinutes: Number(totalMinutes),
    };
}
// Call status distribution (completed/failed/missed etc.)
async function getCallStatusDistribution() {
    const rows = await db_1.db
        .select({ status: schema_1.calls.status, count: (0, drizzle_orm_1.count)() })
        .from(schema_1.calls)
        .groupBy(schema_1.calls.status);
    return rows;
}
// Avg call duration per month
async function getAvgCallDuration() {
    const rows = await db_1.db
        .select({
        period: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.calls.startedAt}, 'YYYY-MM')`,
        avgDuration: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.calls.duration}), 2)`,
    })
        .from(schema_1.calls)
        .where((0, drizzle_orm_1.sql) `${schema_1.calls.duration} IS NOT NULL`)
        .groupBy((0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.calls.startedAt}, 'YYYY-MM')`)
        .orderBy((0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.calls.startedAt}, 'YYYY-MM')`);
    return rows;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions = exports.leads = exports.calls = exports.agents = exports.users = exports.agentTypeEnum = exports.callStatusEnum = exports.planEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["admin", "user"]);
exports.planEnum = (0, pg_core_1.pgEnum)("plan", ["free", "starter", "pro"]);
exports.callStatusEnum = (0, pg_core_1.pgEnum)("call_status", [
    "in-progress",
    "completed",
    "missed",
    "failed",
]);
exports.agentTypeEnum = (0, pg_core_1.pgEnum)("agent_type", [
    "receptionist",
    "appointment",
    "faq",
]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    role: (0, exports.roleEnum)("role").default("user"),
    plan: (0, exports.planEnum)("plan").default("free"),
    minutesLimit: (0, pg_core_1.integer)("minutes_limit").default(100),
    minutesUsed: (0, pg_core_1.integer)("minutes_used").default(0),
    isBlocked: (0, pg_core_1.boolean)("is_blocked").default(false),
    vapiPhoneNumberId: (0, pg_core_1.text)("vapi_phone_number_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.agents = (0, pg_core_1.pgTable)("agents", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id)
        .notNull(),
    vapiAssistantId: (0, pg_core_1.text)("vapi_assistant_id"),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, exports.agentTypeEnum)("type").notNull(),
    systemPrompt: (0, pg_core_1.text)("system_prompt"),
    firstMessage: (0, pg_core_1.text)("first_message"),
    voice: (0, pg_core_1.text)("voice").default("alloy"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)("deleted_at"),
});
exports.calls = (0, pg_core_1.pgTable)("calls", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id)
        .notNull(),
    agentId: (0, pg_core_1.uuid)("agent_id").references(() => exports.agents.id),
    vapiCallId: (0, pg_core_1.text)("vapi_call_id").unique(),
    status: (0, exports.callStatusEnum)("status").default("in-progress"),
    callerNumber: (0, pg_core_1.text)("caller_number"),
    duration: (0, pg_core_1.integer)("duration"),
    recordingUrl: (0, pg_core_1.text)("recording_url"),
    transcript: (0, pg_core_1.text)("transcript"),
    startedAt: (0, pg_core_1.timestamp)("started_at"),
    endedAt: (0, pg_core_1.timestamp)("ended_at"),
});
exports.leads = (0, pg_core_1.pgTable)("leads", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id)
        .notNull(),
    callId: (0, pg_core_1.uuid)("call_id").references(() => exports.calls.id),
    name: (0, pg_core_1.text)("name"),
    phone: (0, pg_core_1.text)("phone"),
    purpose: (0, pg_core_1.text)("purpose"),
    service: (0, pg_core_1.text)("service"),
    appointmentDate: (0, pg_core_1.text)("appointment_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    tokenHash: (0, pg_core_1.text)("token_hash").notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});

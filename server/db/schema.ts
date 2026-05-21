import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user"]);
export const planEnum = pgEnum("plan", ["free", "starter", "pro"]);
export const callStatusEnum = pgEnum("call_status", [
  "in-progress",
  "completed",
  "missed",
  "failed",
]);
export const agentTypeEnum = pgEnum("agent_type", [
  "receptionist",
  "appointment",
  "faq",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("user"),
  plan: planEnum("plan").default("free"),
  minutesLimit: integer("minutes_limit").default(100),
  minutesUsed: integer("minutes_used").default(0),
  isBlocked: boolean("is_blocked").default(false),
  vapiPhoneNumberId: text("vapi_phone_number_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  vapiAssistantId: text("vapi_assistant_id"),
  name: text("name").notNull(),
  type: agentTypeEnum("type").notNull(),
  systemPrompt: text("system_prompt"),
  voice: text("voice").default("alloy"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calls = pgTable("calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  agentId: uuid("agent_id").references(() => agents.id),
  vapiCallId: text("vapi_call_id").unique(),
  status: callStatusEnum("status").default("in-progress"),
  callerNumber: text("caller_number"),
  duration: integer("duration"),
  recordingUrl: text("recording_url"),
  transcript: text("transcript"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  callId: uuid("call_id").references(() => calls.id),
  name: text("name"),
  phone: text("phone"),
  purpose: text("purpose"),
  service: text("service"),
  appointmentDate: text("appointment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

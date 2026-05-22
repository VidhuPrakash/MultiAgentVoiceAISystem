"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRangeSchema = exports.paginationSchema = exports.updateAgentSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    role: zod_1.z.enum(["admin", "user"]).default("user"),
    plan: zod_1.z.enum(["free", "starter", "pro"]).default("free"),
    minutesLimit: zod_1.z.number().int().min(0).default(100),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    plan: zod_1.z.enum(["free", "starter", "pro"]).optional(),
    minutesLimit: zod_1.z.number().int().min(0).optional(),
    role: zod_1.z.enum(["admin", "user"]).optional(),
});
exports.updateAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    systemPrompt: zod_1.z.string().max(5000).optional(),
    voice: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.analyticsRangeSchema = zod_1.z.object({
    range: zod_1.z.enum(["daily", "monthly", "yearly"]).default("monthly"),
    year: zod_1.z.coerce.number().int().min(2020).max(2100).optional(),
});

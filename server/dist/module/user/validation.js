"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentIdSchema = exports.updateAgentSchema = exports.createAgentSchema = void 0;
const zod_1 = require("zod");
exports.createAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: zod_1.z.enum(["receptionist", "appointment", "faq"]),
    systemPrompt: zod_1.z.string().min(10).max(5000).optional(),
    voice: zod_1.z
        .enum(["shimmer", "alloy", "echo", "nova", "onyx", "fable"])
        .default("shimmer"),
    firstMessage: zod_1.z.string().max(300).optional(),
    businessName: zod_1.z.string().max(100).optional(),
});
exports.updateAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    systemPrompt: zod_1.z.string().min(10).max(5000).optional(),
    voice: zod_1.z
        .enum(["shimmer", "alloy", "echo", "nova", "onyx", "fable"])
        .optional(),
    firstMessage: zod_1.z.string().max(300).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.agentIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid agent ID"),
});

import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["receptionist", "appointment", "faq"]),
  systemPrompt: z.string().min(10).max(5000).optional(),
  voice: z
    .enum(["shimmer", "alloy", "echo", "nova", "onyx", "fable"])
    .default("shimmer"),
  firstMessage: z.string().max(300).optional(),
  businessName: z.string().max(100).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  systemPrompt: z.string().min(10).max(5000).optional(),
  voice: z
    .enum(["shimmer", "alloy", "echo", "nova", "onyx", "fable"])
    .optional(),
  firstMessage: z.string().max(300).optional(),
  isActive: z.boolean().optional(),
});

export const agentIdSchema = z.object({
  id: z.string().uuid("Invalid agent ID"),
});

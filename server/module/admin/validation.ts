import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["admin", "user"]).default("user"),
  plan: z.enum(["free", "starter", "pro"]).default("free"),
  minutesLimit: z.number().int().min(0).default(100),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  plan: z.enum(["free", "starter", "pro"]).optional(),
  minutesLimit: z.number().int().min(0).optional(),
  role: z.enum(["admin", "user"]).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  systemPrompt: z.string().max(5000).optional(),
  voice: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const assignPlanSchema = z.object({
  plan: z.enum(["free", "starter", "pro"]),
  minutesLimit: z.number().int().min(0),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

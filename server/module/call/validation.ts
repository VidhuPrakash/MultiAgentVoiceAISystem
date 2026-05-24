import { z } from "zod";

export const callsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["in-progress", "completed", "missed", "failed"]).optional(),
});

export const callIdSchema = z.object({
  id: z.string().uuid("Invalid call ID"),
});

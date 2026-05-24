import { z } from "zod";

export const requestUpgradeSchema = z.object({
  plan: z.enum(["starter", "pro"]),
  message: z.string().max(500).optional(),
});

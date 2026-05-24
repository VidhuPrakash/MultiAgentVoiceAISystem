import { z } from "zod";

export const rangeSchema = z.object({
  range: z.enum(["daily", "monthly", "yearly"]).default("monthly"),
});

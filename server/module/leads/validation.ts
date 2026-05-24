import { z } from "zod";

export const leadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  purpose: z.string().optional(),
});

export const leadIdSchema = z.object({
  id: z.string().uuid("Invalid lead ID"),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(5).max(20).optional(),
  purpose: z.string().max(300).optional(),
  service: z.string().max(100).optional(),
  appointmentDate: z.string().max(100).optional(),
});

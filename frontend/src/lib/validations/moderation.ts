import { z } from "zod";

export const resolveComplaintSchema = z.object({
  action: z.enum(["dismiss", "delete_post", "warn_user", "ban_user"]),
  reason: z.string().min(1, "Укажите причину"),
});

export const banUserSchema = z.object({
  reason: z.string().min(1, "Укажите причину"),
  duration: z.number().int().positive().optional(),
});

export const warnUserSchema = z.object({
  reason: z.string().min(1, "Укажите причину"),
});

export type ResolveComplaintFormData = z.infer<typeof resolveComplaintSchema>;
export type BanUserFormData = z.infer<typeof banUserSchema>;
export type WarnUserFormData = z.infer<typeof warnUserSchema>;

import { z } from "zod";

export const profileSchema = z.object({
  status: z.string().max(100, "Максимум 100 символов").optional(),
});

export const settingsSchema = z.object({
  notifyReplies: z.boolean(),
  notifyMentions: z.boolean(),
});

export const messageSchema = z.object({
  recipientUsername: z.string().min(1, "Укажите получателя"),
  content: z
    .string()
    .min(1, "Введите сообщение")
    .max(5000, "Максимум 5000 символов"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;

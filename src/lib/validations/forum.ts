import { z } from "zod";

export const topicSchema = z.object({
  title: z
    .string()
    .min(5, "Минимум 5 символов")
    .max(200, "Максимум 200 символов"),
  tags: z.string().max(200, "Максимум 200 символов").optional(),
  content: z
    .string()
    .min(10, "Минимум 10 символов")
    .max(50000, "Максимум 50000 символов"),
});

export const replySchema = z.object({
  content: z
    .string()
    .min(1, "Введите текст ответа")
    .max(10000, "Максимум 10000 символов"),
});

export const reportSchema = z.object({
  reason: z.string().min(1, "Выберите причину"),
  description: z.string().max(1000, "Максимум 1000 символов").optional(),
});

export const searchSchema = z.object({
  query: z.string().min(2, "Минимум 2 символа"),
});

export type TopicFormData = z.infer<typeof topicSchema>;
export type ReplyFormData = z.infer<typeof replySchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;

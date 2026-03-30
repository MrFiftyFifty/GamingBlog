import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(30, "Максимум 30 символов")
    .regex(/^[a-zA-Z0-9_-]+$/, "Только латинские буквы, цифры, _ и -"),
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string().min(1, "Подтвердите пароль"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(8, "Минимум 8 символов"),
  confirmNewPassword: z.string().min(1, "Подтвердите новый пароль"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Пароли не совпадают",
  path: ["confirmNewPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

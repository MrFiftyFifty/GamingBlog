"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import * as authApi from "@/lib/api/auth";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      await authApi.forgotPassword(data.email);
      toast.success("Ссылка для восстановления отправлена на email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center px-4 py-12 md:px-6">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center font-display text-fluid-display font-bold tracking-tight text-foreground">
          Восстановление пароля
        </h1>
        <p className="mb-8 text-center text-fluid-body text-muted-foreground">
          Введите email, привязанный к вашему аккаунту
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full min-h-[44px]" disabled={isSubmitting}>
            {isSubmitting ? "Отправка..." : "Отправить ссылку"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="text-accent-signature hover:underline">
            Назад к входу
          </Link>
        </p>
      </div>
    </div>
  );
}

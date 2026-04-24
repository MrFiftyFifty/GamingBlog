"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import * as authApi from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.ok) {
        toast.success("Регистрация завершена");
        router.push("/welcome");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка при регистрации");
    }
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center px-4 py-12 md:px-6">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center font-display text-fluid-display font-bold tracking-tight text-foreground">
          Регистрация
        </h1>
        <p className="mb-8 text-center text-fluid-body text-muted-foreground">
          Создайте аккаунт на форуме
        </p>

        {(FEATURES.steamOAuth || FEATURES.discordOAuth || FEATURES.googleOAuth) && (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {FEATURES.steamOAuth && (
                <Button variant="outline" className="w-full min-h-[44px]" onClick={() => signIn("steam", { callbackUrl: "/welcome" })}>
                  Войти через Steam
                </Button>
              )}
              {FEATURES.discordOAuth && (
                <Button variant="outline" className="w-full min-h-[44px]" onClick={() => signIn("discord", { callbackUrl: "/welcome" })}>
                  Войти через Discord
                </Button>
              )}
              {FEATURES.googleOAuth && (
                <Button variant="outline" className="w-full min-h-[44px]" onClick={() => signIn("google", { callbackUrl: "/welcome" })}>
                  Войти через Google
                </Button>
              )}
            </div>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">или email</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Имя пользователя</label>
            <Input
              id="username"
              {...register("username")}
              placeholder="nickname"
              className={cn(errors.username && "border-destructive")}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Пароль</label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Минимум 8 символов"
              className={cn(errors.password && "border-destructive")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Подтвердите пароль</label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="Повторите пароль"
              className={cn(errors.confirmPassword && "border-destructive")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full min-h-[44px]" disabled={isSubmitting}>
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/auth/login" className="text-accent-signature hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

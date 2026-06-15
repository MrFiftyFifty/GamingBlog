"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/constants";
import * as socialApi from "@/lib/api/social";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      toast.error("Неверный email или пароль");
    } else {
      toast.success("Вход выполнен");
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center px-4 py-12 md:px-6">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center font-display text-fluid-display font-bold tracking-tight text-foreground">
          Вход
        </h1>
        <p className="mb-8 text-center text-fluid-body text-muted-foreground">
          Войдите в свой аккаунт
        </p>

        {(FEATURES.steamOAuth || FEATURES.discordOAuth || FEATURES.googleOAuth) && (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {FEATURES.steamOAuth && (
                <Button
                  variant="outline"
                  className="w-full min-h-[44px]"
                  type="button"
                  onClick={() => {
                    window.location.href = socialApi.steamLoginUrl();
                  }}
                >
                  Steam
                </Button>
              )}
              {FEATURES.discordOAuth && (
                <Button variant="outline" className="w-full min-h-[44px]" onClick={() => signIn("discord", { callbackUrl: "/" })}>
                  Discord
                </Button>
              )}
              {FEATURES.googleOAuth && (
                <Button
                  variant="outline"
                  className="w-full min-h-[44px]"
                  type="button"
                  onClick={() => {
                    window.location.href = socialApi.googleLoginUrl();
                  }}
                >
                  Google
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
              placeholder="Введите пароль"
              className={cn(errors.password && "border-destructive")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {FEATURES.passwordReset && (
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Забыли пароль?
              </Link>
            </div>
          )}
          <Button type="submit" className="w-full min-h-[44px]" disabled={isSubmitting}>
            {isSubmitting ? "Вход..." : "Войти"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/auth/register" className="text-accent-signature hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

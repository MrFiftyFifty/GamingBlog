"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileSchema, type ProfileFormData } from "@/lib/validations/user";
import * as userApi from "@/lib/api/user";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { status: "" },
  });

  useEffect(() => {
    userApi
      .getMyProfile()
      .then((profile) => {
        reset({ status: profile.status });
        if (profile.avatar) {
          setAvatarPreview(profile.avatar);
        }
      })
      .catch(() => undefined);
  }, [reset]);

  async function onSubmit(data: ProfileFormData) {
    try {
      await userApi.updateProfile(data);
      toast.success("Профиль обновлен");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Максимальный размер аватара 5 МБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      await userApi.uploadAvatar(file);
      toast.success("Аватар обновлен");
    } catch {
      toast.error("Не удалось загрузить аватар");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-fluid-display font-bold tracking-tight text-foreground">Мой профиль</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground">Аватар</label>
          <div className="mt-2 flex items-center gap-4">
            {avatarPreview || user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview ?? user?.image ?? ""}
                alt=""
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Загрузка..." : "Изменить"}
              </Button>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-foreground">Статус</label>
          <Input
            id="status"
            {...register("status")}
            placeholder="Краткий статус"
            className="mt-2"
          />
          {errors.status && (
            <p className="mt-1 text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Привязка Steam / Discord настраивается в разделе «Настройки».</p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>
    </div>
  );
}

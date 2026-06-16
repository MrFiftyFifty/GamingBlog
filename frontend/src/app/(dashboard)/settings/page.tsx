"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { settingsSchema, type SettingsFormData } from "@/lib/validations/user";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validations/auth";
import * as userApi from "@/lib/api/user";
import * as authApi from "@/lib/api/auth";
import * as socialApi from "@/lib/api/social";
import { useSocialAccounts } from "@/hooks/use-social";
import { FEATURES } from "@/lib/constants";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  steam: "Steam",
};

export default function SettingsPage() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { data: socialAccounts = [], mutate: refreshSocial } = useSocialAccounts();

  const {
    register: registerSettings,
    handleSubmit: handleSettings,
    reset: resetSettings,
    formState: { isSubmitting: savingSettings },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { notifyReplies: true, notifyMentions: true },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: changingPassword },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    userApi.getSettings().then((settings) => resetSettings(settings));
  }, [resetSettings]);

  async function onSaveSettings(data: SettingsFormData) {
    try {
      await userApi.updateSettings(data);
      toast.success("Настройки сохранены");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  async function onChangePassword(data: ChangePasswordFormData) {
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast.success("Пароль изменен");
      resetPassword();
      setPasswordModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  async function handleDisconnect(id: number) {
    try {
      await socialApi.disconnectSocialAccount(id);
      toast.success("Аккаунт отвязан");
      await refreshSocial();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось отвязать");
    }
  }

  async function handleSteamSync() {
    try {
      const result = await socialApi.syncSteamLibrary();
      toast.success(`Steam: синхронизировано игр — ${result.synced ?? 0}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка синхронизации Steam");
    }
  }

  const googleLinked = socialAccounts.some((a) => a.provider === "google");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-fluid-display font-bold tracking-tight text-foreground">
        Настройки
      </h1>
      <form onSubmit={handleSettings(onSaveSettings)} className="space-y-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-fluid-title font-semibold">Безопасность</h2>
          <p className="mt-2 text-sm text-muted-foreground">Смена пароля учётной записи.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => setPasswordModalOpen(true)}
          >
            Изменить пароль
          </Button>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-fluid-title font-semibold">Уведомления</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Настройки уведомлений сохраняются локально в браузере (на бэкенде отдельной модели пока нет).
          </p>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...registerSettings("notifyReplies")} className="rounded border-input" />
              <span className="text-sm">Уведомления об ответах в темах</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...registerSettings("notifyMentions")} className="rounded border-input" />
              <span className="text-sm">Упоминания @username</span>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-fluid-title font-semibold">Привязанные аккаунты</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            OAuth через Django Allauth на бэкенде. Для Google укажите ключи в backend/.env.
          </p>
          <div className="mt-4 space-y-3">
            {FEATURES.googleOAuth && (
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm font-medium">Google</span>
                {googleLinked ? (
                  <div className="flex gap-2">
                    <span className="text-xs text-muted-foreground self-center">Привязан</span>
                    {socialAccounts
                      .filter((a) => a.provider === "google")
                      .map((account) => (
                        <Button
                          key={account.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(account.id)}
                        >
                          Отвязать
                        </Button>
                      ))}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = socialApi.googleConnectUrl();
                    }}
                  >
                    Привязать
                  </Button>
                )}
              </div>
            )}

            {FEATURES.steamOAuth && (
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm font-medium">Steam</span>
                <Button type="button" variant="outline" size="sm" onClick={handleSteamSync}>
                  Синхронизировать библиотеку
                </Button>
              </div>
            )}

            {socialAccounts
              .filter((a) => a.provider !== "google")
              .map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <span className="text-sm font-medium">
                    {PROVIDER_LABELS[account.provider] ?? account.provider}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    Отвязать
                  </Button>
                </div>
              ))}
          </div>
        </section>

        <Button type="submit" disabled={savingSettings}>
          {savingSettings ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>

      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Изменить пароль">
        <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Текущий пароль</label>
            <Input type="password" {...registerPassword("currentPassword")} />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Новый пароль</label>
            <Input type="password" {...registerPassword("newPassword")} />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-destructive">{passwordErrors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Подтвердите новый пароль</label>
            <Input type="password" {...registerPassword("confirmNewPassword")} />
            {passwordErrors.confirmNewPassword && (
              <p className="mt-1 text-sm text-destructive">
                {passwordErrors.confirmNewPassword.message}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setPasswordModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? "Изменение..." : "Изменить"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

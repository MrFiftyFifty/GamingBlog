"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import {
  resolveComplaintSchema,
  banUserSchema,
  warnUserSchema,
  type ResolveComplaintFormData,
  type BanUserFormData,
  type WarnUserFormData,
} from "@/lib/validations/moderation";
import * as modApi from "@/lib/api/moderation";
import { cn } from "@/lib/utils";

type TabValue = "pending" | "resolved";

const MOCK_COMPLAINTS = [
  {
    id: "1",
    postId: "p1",
    topicId: "1",
    topicTitle: "Marathon — первый взгляд",
    sectionSlug: "rpg",
    reportedContent: "Это сообщение содержит оскорбления в адрес других пользователей...",
    reportedUser: "BadUser123",
    reporter: "ProGamer42",
    reason: "Оскорбления",
    status: "pending" as const,
    createdAt: "15 мар, 14:30",
  },
  {
    id: "2",
    postId: "p2",
    topicId: "2",
    topicTitle: "Crimson Desert — дата выхода",
    sectionSlug: "rpg",
    reportedContent: "Очередной спам с рекламой сторонних сайтов...",
    reportedUser: "SpamBot99",
    reporter: "RPGLover",
    reason: "Спам",
    status: "pending" as const,
    createdAt: "14 мар, 20:15",
  },
  {
    id: "3",
    postId: "p3",
    topicId: "3",
    topicTitle: "GTA VI - теории",
    sectionSlug: "action",
    reportedContent: "Сообщение было удалено модератором.",
    reportedUser: "TrollAccount",
    reporter: "ActionHero",
    reason: "Нарушение правил",
    status: "resolved" as const,
    createdAt: "13 мар, 10:00",
  },
];

const ACTION_LABELS: Record<string, string> = {
  dismiss: "Отклонить",
  delete_post: "Удалить сообщение",
  warn_user: "Предупредить",
  ban_user: "Заблокировать",
};

export default function ModerationPage() {
  const [tab, setTab] = useState<TabValue>("pending");
  const [page, setPage] = useState(1);
  const [resolveTarget, setResolveTarget] = useState<typeof MOCK_COMPLAINTS[0] | null>(null);
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [warnTarget, setWarnTarget] = useState<string | null>(null);

  const filtered = MOCK_COMPLAINTS.filter((c) => c.status === tab);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const {
    register: registerResolve,
    handleSubmit: handleResolve,
    reset: resetResolve,
    formState: { errors: resolveErrors, isSubmitting: resolving },
  } = useForm<ResolveComplaintFormData>({
    resolver: zodResolver(resolveComplaintSchema),
  });

  const {
    register: registerBan,
    handleSubmit: handleBan,
    reset: resetBan,
    formState: { errors: banErrors, isSubmitting: banning },
  } = useForm<BanUserFormData>({
    resolver: zodResolver(banUserSchema),
  });

  const {
    register: registerWarn,
    handleSubmit: handleWarn,
    reset: resetWarn,
    formState: { errors: warnErrors, isSubmitting: warning },
  } = useForm<WarnUserFormData>({
    resolver: zodResolver(warnUserSchema),
  });

  async function onResolve(data: ResolveComplaintFormData) {
    if (!resolveTarget) return;
    try {
      await modApi.resolveComplaint(resolveTarget.id, data.action, data.reason);
      toast.success("Жалоба обработана");
      resetResolve();
      setResolveTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  async function onBan(data: BanUserFormData) {
    if (!banTarget) return;
    try {
      await modApi.banUser(banTarget, data.reason, data.duration);
      toast.success(`Пользователь ${banTarget} заблокирован`);
      resetBan();
      setBanTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  async function onWarn(data: WarnUserFormData) {
    if (!warnTarget) return;
    try {
      await modApi.warnUser(warnTarget, data.reason);
      toast.success(`Предупреждение отправлено пользователю ${warnTarget}`);
      resetWarn();
      setWarnTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display text-fluid-display font-bold tracking-tight text-foreground">Панель модератора</h1>
        <Button variant="outline" asChild>
          <Link href="/moderation/log">Лог действий</Link>
        </Button>
      </div>
      <div className="mb-6 flex gap-2">
        {(["pending", "resolved"] as TabValue[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setPage(1); }}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200",
              tab === t
                ? "bg-accent-signature text-accent-signature-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "pending" ? "Ожидающие" : "Обработанные"}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 md:px-6">
          <h2 className="font-display text-fluid-title font-semibold">Очередь жалоб</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {tab === "pending" ? "необработанных" : "обработанных"} жалоб
          </p>
        </div>
        {paged.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {tab === "pending" ? "Нет необработанных жалоб." : "Нет обработанных жалоб."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paged.map((complaint) => (
              <div key={complaint.id} className="p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        {complaint.reason}
                      </span>
                      <span className="text-xs text-muted-foreground">{complaint.createdAt}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      <Link href={`/forum/${complaint.sectionSlug}/topic/${complaint.topicId}`} className="hover:text-accent-signature">
                        {complaint.topicTitle}
                      </Link>
                    </p>
                    <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground line-clamp-3">
                      {complaint.reportedContent}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Автор: <Link href={`/user/${complaint.reportedUser}`} className="font-medium text-foreground hover:underline">{complaint.reportedUser}</Link>
                      {" · "}
                      Пожаловался: {complaint.reporter}
                    </p>
                  </div>
                  {tab === "pending" && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setResolveTarget(complaint)}>
                        Обработать
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setWarnTarget(complaint.reportedUser)}>
                        Предупредить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => setBanTarget(complaint.reportedUser)}
                      >
                        Заблокировать
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
      )}

      <Modal
        open={!!resolveTarget}
        onClose={() => { setResolveTarget(null); resetResolve(); }}
        title="Обработать жалобу"
      >
        <form onSubmit={handleResolve(onResolve)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Действие</label>
            <select
              {...registerResolve("action")}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                resolveErrors.action && "border-destructive"
              )}
            >
              <option value="">Выберите действие...</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {resolveErrors.action && (
              <p className="mt-1 text-sm text-destructive">{resolveErrors.action.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Причина</label>
            <textarea
              {...registerResolve("reason")}
              rows={3}
              placeholder="Опишите причину решения..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {resolveErrors.reason && (
              <p className="mt-1 text-sm text-destructive">{resolveErrors.reason.message}</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => { setResolveTarget(null); resetResolve(); }}>
              Отмена
            </Button>
            <Button type="submit" disabled={resolving}>
              {resolving ? "Обработка..." : "Подтвердить"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!banTarget}
        onClose={() => { setBanTarget(null); resetBan(); }}
        title={`Заблокировать ${banTarget ?? ""}`}
      >
        <form onSubmit={handleBan(onBan)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Причина</label>
            <textarea
              {...registerBan("reason")}
              rows={3}
              placeholder="Причина блокировки..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {banErrors.reason && (
              <p className="mt-1 text-sm text-destructive">{banErrors.reason.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Длительность (дней, пусто = навсегда)</label>
            <input
              type="number"
              {...registerBan("duration", { valueAsNumber: true })}
              min={1}
              placeholder="Навсегда"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => { setBanTarget(null); resetBan(); }}>
              Отмена
            </Button>
            <Button type="submit" disabled={banning} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {banning ? "Блокировка..." : "Заблокировать"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!warnTarget}
        onClose={() => { setWarnTarget(null); resetWarn(); }}
        title={`Предупредить ${warnTarget ?? ""}`}
      >
        <form onSubmit={handleWarn(onWarn)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Причина предупреждения</label>
            <textarea
              {...registerWarn("reason")}
              rows={3}
              placeholder="Опишите причину..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {warnErrors.reason && (
              <p className="mt-1 text-sm text-destructive">{warnErrors.reason.message}</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => { setWarnTarget(null); resetWarn(); }}>
              Отмена
            </Button>
            <Button type="submit" disabled={warning}>
              {warning ? "Отправка..." : "Отправить предупреждение"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

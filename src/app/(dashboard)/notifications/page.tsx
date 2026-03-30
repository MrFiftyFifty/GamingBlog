"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import * as notificationsApi from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "reply" as const, message: "ProGamer42 ответил в теме «Marathon — первый взгляд»", link: "/forum/rpg/topic/1", read: false, createdAt: "15 мар, 14:30", actor: { username: "ProGamer42", avatar: null } },
  { id: "2", type: "mention" as const, message: "RPGLover упомянул вас в теме «Crimson Desert»", link: "/forum/rpg/topic/2", read: false, createdAt: "14 мар, 20:15", actor: { username: "RPGLover", avatar: null } },
  { id: "3", type: "badge" as const, message: "Вы получили значок «10 ответов»", link: "/profile", read: true, createdAt: "13 мар, 10:00", actor: null },
  { id: "4", type: "reply" as const, message: "ActionHero ответил в теме «Life Is Strange: Reunion»", link: "/forum/rpg/topic/4", read: true, createdAt: "12 мар, 18:45", actor: { username: "ActionHero", avatar: null } },
];

const typeIcons: Record<string, string> = {
  reply: "💬",
  mention: "@",
  badge: "🏆",
  system: "📢",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      /* API not ready */
    }
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Все уведомления отмечены как прочитанные");
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      /* API not ready */
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-fluid-display font-bold tracking-tight text-foreground">
          Уведомления
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-accent-signature px-2 text-xs font-medium text-accent-signature-foreground align-middle">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Прочитать все
          </Button>
        )}
      </div>
      <div className="rounded-lg border border-border divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">
            Нет уведомлений.
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 p-4 transition-colors duration-200",
                !n.read && "bg-accent-signature/5"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm">
                {typeIcons[n.type]}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={n.link ?? "#"}
                  onClick={() => markAsRead(n.id)}
                  className="text-sm text-foreground hover:text-accent-signature transition-colors duration-200"
                >
                  {n.message}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.createdAt}</p>
              </div>
              {!n.read && (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-signature" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

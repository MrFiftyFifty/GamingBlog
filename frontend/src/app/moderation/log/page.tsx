"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

const ACTION_LABELS: Record<string, string> = {
  delete_post: "Удалил сообщение",
  edit_post: "Отредактировал сообщение",
  warn_user: "Предупредил",
  ban_user: "Заблокировал",
  unban_user: "Разблокировал",
  pin_topic: "Закрепил тему",
  close_topic: "Закрыл тему",
  dismiss_complaint: "Отклонил жалобу",
};

const MOCK_ACTIONS = [
  { id: "1", moderator: "Admin", action: "ban_user", targetUser: "SpamBot99", reason: "Систематический спам", createdAt: "15 мар, 16:00" },
  { id: "2", moderator: "Moderator1", action: "warn_user", targetUser: "BadUser123", reason: "Оскорбления", createdAt: "15 мар, 14:45" },
  { id: "3", moderator: "Moderator1", action: "delete_post", targetUser: "TrollAccount", reason: "Нарушение правил форума", createdAt: "14 мар, 22:30" },
  { id: "4", moderator: "Admin", action: "pin_topic", targetUser: null, reason: "Важная тема для сообщества", createdAt: "14 мар, 10:00" },
  { id: "5", moderator: "Moderator1", action: "dismiss_complaint", targetUser: null, reason: "Ложная жалоба", createdAt: "13 мар, 18:00" },
];

const PAGE_SIZE = 20;

export default function ModActionLogPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(MOCK_ACTIONS.length / PAGE_SIZE));
  const paged = MOCK_ACTIONS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-fluid-caption text-muted-foreground">
            <Link href="/moderation" className="hover:text-foreground">Модерация</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Лог действий</span>
          </nav>
          <h1 className="mt-2 font-display text-fluid-display font-bold tracking-tight text-foreground">Лог действий</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/moderation">Назад к жалобам</Link>
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Дата</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Модератор</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действие</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Цель</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Причина</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Лог действий пуст.
                  </td>
                </tr>
              ) : (
                paged.map((action) => (
                  <tr key={action.id} className="transition-colors duration-200 hover:bg-accent/30">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{action.createdAt}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/user/${action.moderator}`} className="hover:text-accent-signature">
                        {action.moderator}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {ACTION_LABELS[action.action] ?? action.action}
                    </td>
                    <td className="px-4 py-3">
                      {action.targetUser ? (
                        <Link href={`/user/${action.targetUser}`} className="hover:text-accent-signature">
                          {action.targetUser}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{action.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
      )}
    </div>
  );
}

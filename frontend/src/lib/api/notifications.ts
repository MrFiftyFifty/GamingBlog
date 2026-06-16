import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import { mockNotifications, mockUnreadCount } from "@/lib/mocks/api-mocks";
import type { Notification, PaginatedResponse } from "./types";

function normalizeNotification(raw: Record<string, unknown>): Notification {
  const sender = raw.sender as Record<string, unknown> | undefined;
  return {
    id: String(raw.id ?? ""),
    type: (raw.notification_type as Notification["type"]) ?? "system",
    message: String(raw.message ?? raw.content ?? ""),
    link: typeof raw.link === "string" ? raw.link : undefined,
    read: Boolean(raw.is_read ?? raw.read),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ""),
    actor: sender
      ? {
          username: String(sender.username ?? ""),
          avatar: (sender.avatar as string | null) ?? null,
        }
      : undefined,
  };
}

export async function getNotifications(page?: number) {
  if (!FEATURES.notificationsUnreadCount && !FEATURES.notificationsMarkRead) {
    return mockNotifications();
  }
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/notifications/${qs ? `?${qs}` : ""}`
  );
  const results = Array.isArray(raw.results)
    ? (raw.results as Record<string, unknown>[]).map(normalizeNotification)
    : Array.isArray(raw)
      ? (raw as Record<string, unknown>[]).map(normalizeNotification)
      : [];
  return {
    results,
    count: typeof raw.count === "number" ? raw.count : results.length,
    next: (raw.next as string | null) ?? null,
    previous: (raw.previous as string | null) ?? null,
  } satisfies PaginatedResponse<Notification>;
}

export async function getUnreadCount() {
  if (!FEATURES.notificationsUnreadCount) return mockUnreadCount();
  const raw = await apiFetch<{ unread_count?: number; count?: number }>(
    "/api/notifications/unread_count/"
  );
  return { count: raw.unread_count ?? raw.count ?? 0 };
}

export async function markAsRead(notificationId: string) {
  if (!FEATURES.notificationsMarkRead) return Promise.resolve();
  return apiFetch<void>(`/api/notifications/${notificationId}/mark_as_read/`, {
    method: "POST",
  });
}

export async function markAllAsRead() {
  if (!FEATURES.notificationsMarkRead) return Promise.resolve();
  return apiFetch<void>("/api/notifications/mark_all_as_read/", { method: "POST" });
}

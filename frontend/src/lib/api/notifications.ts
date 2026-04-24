import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import { mockNotifications, mockUnreadCount } from "@/lib/mocks/api-mocks";
import type { Notification, PaginatedResponse } from "./types";

export function getNotifications(page?: number) {
  if (!FEATURES.forum) return mockNotifications();
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<Notification>>(
    `/notifications/${qs ? `?${qs}` : ""}`
  );
}

export function getUnreadCount() {
  if (!FEATURES.notificationsUnreadCount) return mockUnreadCount();
  return apiFetch<{ count: number }>("/api/notifications/unread-count/");
}

export function markAsRead(notificationId: string) {
  if (!FEATURES.notificationsMarkRead) return Promise.resolve();
  return apiFetch<void>(`/api/notifications/${notificationId}/read/`, {
    method: "POST",
  });
}

export function markAllAsRead() {
  if (!FEATURES.notificationsMarkRead) return Promise.resolve();
  return apiFetch<void>("/api/notifications/read-all/", { method: "POST" });
}

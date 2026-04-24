import { apiFetch } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import type { Notification, PaginatedResponse } from "./types";

export function getNotifications(page?: number) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<Notification>>(
    `/notifications/${qs ? `?${qs}` : ""}`
  );
}

export function getUnreadCount() {
  if (!FEATURES.notificationsUnreadCount) {
    return Promise.resolve({ count: 0 });
  }
  return apiFetch<{ count: number }>("/api/notifications/unread-count/");
}

export function markAsRead(notificationId: string) {
  if (!FEATURES.notificationsMarkRead) {
    return Promise.reject(new Error("FEATURE_DISABLED: notificationsMarkRead"));
  }
  return apiFetch<void>(`/api/notifications/${notificationId}/read/`, {
    method: "POST",
  });
}

export function markAllAsRead() {
  if (!FEATURES.notificationsMarkRead) {
    return Promise.reject(new Error("FEATURE_DISABLED: notificationsMarkRead"));
  }
  return apiFetch<void>("/api/notifications/read-all/", { method: "POST" });
}

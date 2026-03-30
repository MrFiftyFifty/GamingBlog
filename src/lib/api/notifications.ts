import { apiFetch } from "@/lib/api";
import type { Notification, PaginatedResponse } from "./types";

export function getNotifications(page?: number) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<Notification>>(
    `/api/notifications${qs ? `?${qs}` : ""}`
  );
}

export function getUnreadCount() {
  return apiFetch<{ count: number }>("/api/notifications/unread-count");
}

export function markAsRead(notificationId: string) {
  return apiFetch<void>(`/api/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export function markAllAsRead() {
  return apiFetch<void>("/api/notifications/read-all", { method: "POST" });
}

import useSWR from "swr";
import * as notificationsApi from "@/lib/api/notifications";

export function useNotifications(page?: number) {
  return useSWR(["notifications", page], () =>
    notificationsApi.getNotifications(page)
  );
}

export function useUnreadCount() {
  return useSWR("notifications/unread", () =>
    notificationsApi.getUnreadCount(), {
    refreshInterval: 30000,
  });
}

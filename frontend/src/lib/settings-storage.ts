import type { UpdateSettingsRequest } from "@/lib/api/types";

const SETTINGS_KEY = "gamingblog_notify_settings";

const DEFAULT_SETTINGS: UpdateSettingsRequest = {
  notifyReplies: true,
  notifyMentions: true,
};

export function loadNotifySettings(): UpdateSettingsRequest {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    return DEFAULT_SETTINGS;
  }
  return DEFAULT_SETTINGS;
}

export function saveNotifySettings(data: UpdateSettingsRequest) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

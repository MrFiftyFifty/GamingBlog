import { apiFetch, apiUpload } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import type {
  User,
  UpdateProfileRequest,
  UpdateSettingsRequest,
} from "./types";

export function getUser(username: string) {
  if (!FEATURES.userProfilesByUsername) {
    return Promise.reject(new Error("FEATURE_DISABLED: userProfilesByUsername"));
  }
  return apiFetch<User>(`/api/users/${username}/`);
}

export function updateProfile(data: UpdateProfileRequest) {
  if (!FEATURES.userSettings) {
    return Promise.reject(new Error("FEATURE_DISABLED: userSettings"));
  }
  return apiFetch<User>("/api/users/me/profile/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function uploadAvatar(file: File) {
  if (!FEATURES.avatarUpload) {
    return Promise.reject(new Error("FEATURE_DISABLED: avatarUpload"));
  }
  const formData = new FormData();
  formData.append("avatar", file);
  return apiUpload<{ avatarUrl: string }>("/api/users/me/avatar/", formData);
}

export function getSettings() {
  if (!FEATURES.userSettings) {
    return Promise.reject(new Error("FEATURE_DISABLED: userSettings"));
  }
  return apiFetch<UpdateSettingsRequest>("/api/users/me/settings/");
}

export function updateSettings(data: UpdateSettingsRequest) {
  if (!FEATURES.userSettings) {
    return Promise.reject(new Error("FEATURE_DISABLED: userSettings"));
  }
  return apiFetch<void>("/api/users/me/settings/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function searchUsers(query: string) {
  if (!FEATURES.userProfilesByUsername) {
    return Promise.resolve([] as { username: string; avatar?: string | null }[]);
  }
  return apiFetch<{ username: string; avatar?: string | null }[]>(
    `/api/users/search/?q=${encodeURIComponent(query)}`
  );
}

export function getUserTopics(username: string, page?: number) {
  if (!FEATURES.userProfilesByUsername) {
    return Promise.resolve(
      [] as { id: string; title: string; sectionSlug: string; createdAt: string }[]
    );
  }
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<{ id: string; title: string; sectionSlug: string; createdAt: string }[]>(
    `/api/users/${username}/topics/${qs ? `?${qs}` : ""}`
  );
}

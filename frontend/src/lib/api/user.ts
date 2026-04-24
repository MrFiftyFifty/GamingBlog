import { apiFetch, apiUpload } from "@/lib/api";
import type {
  User,
  UpdateProfileRequest,
  UpdateSettingsRequest,
} from "./types";

export function getUser(username: string) {
  return apiFetch<User>(`/api/users/${username}`);
}

export function updateProfile(data: UpdateProfileRequest) {
  return apiFetch<User>("/api/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiUpload<{ avatarUrl: string }>("/api/users/me/avatar", formData);
}

export function getSettings() {
  return apiFetch<UpdateSettingsRequest>("/api/users/me/settings");
}

export function updateSettings(data: UpdateSettingsRequest) {
  return apiFetch<void>("/api/users/me/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function searchUsers(query: string) {
  return apiFetch<{ username: string; avatar?: string | null }[]>(
    `/api/users/search?q=${encodeURIComponent(query)}`
  );
}

export function getUserTopics(username: string, page?: number) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  const qs = params.toString();
  return apiFetch<{ id: string; title: string; sectionSlug: string; createdAt: string }[]>(
    `/api/users/${username}/topics${qs ? `?${qs}` : ""}`
  );
}

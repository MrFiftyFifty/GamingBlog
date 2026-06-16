import { apiFetch, apiUpload } from "@/lib/api";
import { FEATURES } from "@/lib/constants";
import {
  mockUser,
  mockUserTopics,
  mockUserSearch,
} from "@/lib/mocks/api-mocks";
import { normalizePublicUser } from "./normalize";
import { loadNotifySettings, saveNotifySettings } from "@/lib/settings-storage";
import type {
  User,
  UpdateProfileRequest,
  UpdateSettingsRequest,
} from "./types";

export async function getUser(username: string) {
  if (!FEATURES.userProfilesByUsername) return mockUser(username);
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/users/${encodeURIComponent(username)}/profile/`
  );
  return normalizePublicUser(raw);
}

export async function getMyProfile() {
  const raw = await apiFetch<Record<string, unknown>>("/api/profiles/me/");
  return {
    status: String(raw.status ?? ""),
    avatar: (raw.avatar as string | null) ?? null,
    reputation: Number(raw.reputation ?? 0),
  };
}

export async function updateProfile(data: UpdateProfileRequest) {
  if (!FEATURES.userSettings) {
    return Promise.resolve({} as User);
  }
  const raw = await apiFetch<Record<string, unknown>>("/api/profiles/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return normalizePublicUser(raw);
}

export async function uploadAvatar(file: File) {
  if (!FEATURES.avatarUpload) {
    return new Promise<{ avatarUrl: string }>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    });
  }
  const formData = new FormData();
  formData.append("avatar", file);
  return apiUpload<{ avatarUrl: string }>("/api/profiles/me/avatar/", formData);
}

export function getSettings() {
  return Promise.resolve(loadNotifySettings());
}

export function updateSettings(data: UpdateSettingsRequest) {
  saveNotifySettings(data);
  return Promise.resolve();
}

export async function searchUsers(query: string) {
  if (!FEATURES.userProfilesByUsername) return mockUserSearch(query);
  const raw = await apiFetch<
    { id: number; username: string; avatar?: string | null }[]
  >(`/api/users/search/?q=${encodeURIComponent(query)}`);
  return raw.map((item) => ({
    username: item.username,
    avatar: item.avatar ?? null,
  }));
}

export async function getUserTopics(username: string) {
  if (!FEATURES.userProfilesByUsername) return mockUserTopics(username);
  return apiFetch<{ id: string; title: string; sectionSlug: string; createdAt: string }[]>(
    `/api/users/${encodeURIComponent(username)}/topics/`
  );
}
